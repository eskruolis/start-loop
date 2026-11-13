import { JWT } from "google-auth-library"
import type { z } from "zod"
import { kindsOf } from "@/lib/fields"
import { sheetsCredentials } from "../../env"
import { applyQuery } from "../query"
import { type Cell, columnLetter, objectToRow, rowsToObjects } from "../sheets-mapping"
import { type EntityDef, type InputOf, parseRecord, type RecordOf, type Repository } from "../types"

/**
 * Stores records in a Google Sheets tab: row 1 holds the field names (any order, extra columns
 * are kept untouched), every other row is a record, and the `id` column identifies it.
 * Reads are whole-tab (fine up to a few thousand rows); search, sort and paging run in memory.
 * Rows that fail validation are skipped and logged; `pnpm sheets:check` lists them.
 */
const API = "https://sheets.googleapis.com/v4/spreadsheets"

type Client = { spreadsheetId: string; jwt: JWT }

let cached: Client | null = null
function client(): Client {
  if (cached) return cached
  const creds = sheetsCredentials()
  if (!creds) {
    throw new Error(
      "Google Sheets is not configured: set GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY (docs/DATA-SOURCES.md)"
    )
  }
  const jwt = new JWT({
    email: creds.email,
    key: creds.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
  cached = { spreadsheetId: creds.spreadsheetId, jwt }
  return cached
}

async function call<T>(
  path: string,
  method: "GET" | "POST" | "PUT" = "GET",
  data?: unknown
): Promise<T> {
  const c = client()
  const res = await c.jwt.request<T>({ url: `${API}/${c.spreadsheetId}${path}`, method, data })
  return res.data
}

const range = (tab: string, cells = "") =>
  encodeURIComponent(`'${tab.replace(/'/g, "''")}'${cells ? `!${cells}` : ""}`)

/** The tab's raw values, header first. */
export async function readTab(tab: string): Promise<Cell[][]> {
  const res = await call<{ values?: Cell[][] }>(
    `/values/${range(tab)}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`
  )
  return res.values ?? []
}

/** Writes values into a block of cells (USER_ENTERED: Sheets parses numbers and dates). */
export async function writeCells(
  tab: string,
  cells: string,
  values: (string | number | boolean)[][]
) {
  await call(`/values/${range(tab, cells)}?valueInputOption=USER_ENTERED`, "PUT", { values })
}

async function sheetIdOf(tab: string): Promise<number> {
  const res = await call<{ sheets: { properties: { sheetId: number; title: string } }[] }>(
    "?fields=sheets.properties(sheetId,title)"
  )
  const found = res.sheets.find((s) => s.properties.title === tab)
  if (!found) throw new Error(`Google Sheets: no tab named "${tab}"`)
  return found.properties.sheetId
}

export function sheetsRepository<E extends EntityDef<z.ZodObject, z.ZodObject>>(
  entity: E
): Repository<RecordOf<E>, InputOf<E>> {
  const kinds = kindsOf(entity.schema)
  const tab = entity.sheet.tab

  async function load() {
    const values = await readTab(tab)
    const header = values[0] ?? []
    const records: { rowNumber: number; record: RecordOf<E> }[] = []
    for (const { rowNumber, data } of rowsToObjects(values, kinds)) {
      const parsed = entity.schema.safeParse(data)
      if (parsed.success) records.push({ rowNumber, record: parseRecord(entity, parsed.data) })
      else
        console.warn(`[sheets] ${tab} row ${rowNumber} skipped: ${parsed.error.issues[0]?.message}`)
    }
    return { header, records }
  }

  async function find(id: string) {
    const { header, records } = await load()
    const hit = records.find((r) => r.record.id === id)
    if (!hit) throw new Error(`${entity.label}: ${id} not found in the "${tab}" tab`)
    return { header, ...hit }
  }

  return {
    async list(query = {}) {
      const { records } = await load()
      return applyQuery(
        records.map((r) => r.record),
        { sort: entity.defaultSort, ...query },
        entity.searchable
      )
    },
    async all() {
      return (await load()).records.map((r) => r.record)
    },
    async get(id) {
      const { records } = await load()
      return records.find((r) => r.record.id === id)?.record ?? null
    },
    async create(input) {
      const record = parseRecord(entity, { ...entity.input.parse(input), id: crypto.randomUUID() })
      const header = (await readTab(tab))[0] ?? []
      if (!header.length) throw new Error(`Google Sheets: the "${tab}" tab has no header row`)
      await call(
        `/values/${range(tab, "A1")}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        "POST",
        {
          values: [objectToRow(record, header, kinds)],
        }
      )
      return record
    },
    async update(id, patch) {
      const { header, rowNumber, record } = await find(id)
      const next = parseRecord(entity, { ...record, ...entity.input.partial().parse(patch), id })
      const last = columnLetter(header.length - 1)
      await writeCells(tab, `A${rowNumber}:${last}${rowNumber}`, [objectToRow(next, header, kinds)])
      return next
    },
    async remove(id) {
      const { rowNumber } = await find(id)
      await call(":batchUpdate", "POST", {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: await sheetIdOf(tab),
                dimension: "ROWS",
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          },
        ],
      })
    },
  }
}
