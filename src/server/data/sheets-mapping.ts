import type { FieldKind } from "@/lib/fields"
import { parseMoney } from "@/lib/money"

export { parseMoney }

/**
 * Pure conversions between Google Sheets cells and app values. Reads use
 * valueRenderOption=UNFORMATTED_VALUE + dateTimeRenderOption=SERIAL_NUMBER, so numbers come as
 * numbers, ticked boxes as booleans and dates as day counts since 1899-12-30 (Sheets' epoch).
 */
export type Cell = string | number | boolean | null | undefined

const SHEETS_EPOCH_MS = Date.UTC(1899, 11, 30)
const DAY_MS = 86_400_000

export function parseNumber(cell: Cell): number | null {
  if (typeof cell === "number") return Number.isFinite(cell) ? cell : null
  if (typeof cell !== "string") return null
  const cents = parseMoney(cell)
  return cents === null ? null : cents / 100
}

/** A Sheets date (serial number, "2026-11-13", "13/11/2026") → "2026-11-13". */
export function parseDate(cell: Cell): string | null {
  if (typeof cell === "number")
    return new Date(SHEETS_EPOCH_MS + Math.round(cell) * DAY_MS).toISOString().slice(0, 10)
  if (typeof cell !== "string" || !cell.trim()) return null
  const s = cell.trim()
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  // Day first (Europe): 13/11/2026 or 13.11.2026
  const dmy = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(s)
  if (dmy) return `${dmy[3]}-${dmy[2]?.padStart(2, "0")}-${dmy[1]?.padStart(2, "0")}`
  return null
}

export function parseBoolean(cell: Cell): boolean | null {
  if (typeof cell === "boolean") return cell
  if (typeof cell === "number") return cell !== 0
  if (typeof cell !== "string") return null
  const s = cell.trim().toLowerCase()
  if (["true", "yes", "y", "1", "x", "✓"].includes(s)) return true
  if (["false", "no", "n", "0", ""].includes(s)) return false
  return null
}

/** One cell → the app's value for that kind of field (undefined when the cell is empty). */
export function fromCell(kind: FieldKind, cell: Cell): unknown {
  if (cell === null || cell === undefined || cell === "")
    return kind === "boolean" ? false : undefined
  switch (kind) {
    case "money":
      return (typeof cell === "boolean" ? null : parseMoney(cell)) ?? cell
    case "number":
      return parseNumber(cell) ?? cell
    case "date":
      return parseDate(cell) ?? cell
    case "boolean":
      return parseBoolean(cell) ?? cell
    default:
      return String(cell).trim()
  }
}

/** An app value → what is written to the sheet (USER_ENTERED, so Sheets parses dates and numbers). */
export function toCell(kind: FieldKind, value: unknown): string | number | boolean {
  if (value === null || value === undefined) return ""
  switch (kind) {
    case "money":
      return typeof value === "number" ? value / 100 : String(value)
    case "number":
    case "boolean":
      return typeof value === "number" || typeof value === "boolean" ? value : String(value)
    default:
      return String(value)
  }
}

/** The header row → the field each column holds. Unknown columns are ignored. */
export function columnMap(
  header: readonly Cell[],
  fieldNames: readonly string[]
): Map<string, number> {
  const wanted = new Map(fieldNames.map((f) => [f.toLowerCase(), f]))
  const map = new Map<string, number>()
  header.forEach((cell, index) => {
    const field = wanted.get(
      String(cell ?? "")
        .trim()
        .toLowerCase()
    )
    if (field && !map.has(field)) map.set(field, index)
  })
  return map
}

/** Data rows → plain objects keyed by field name, with their sheet row number (1-based). */
export function rowsToObjects(
  values: readonly (readonly Cell[])[],
  kinds: Record<string, FieldKind>
): { rowNumber: number; data: Record<string, unknown> }[] {
  const [header = [], ...rows] = values
  const columns = columnMap(header, Object.keys(kinds))
  const out: { rowNumber: number; data: Record<string, unknown> }[] = []
  rows.forEach((row, i) => {
    if (!row.some((c) => c !== "" && c !== null && c !== undefined)) return
    const data: Record<string, unknown> = {}
    for (const [field, col] of columns) {
      const value = fromCell(kinds[field] ?? "text", row[col])
      if (value !== undefined) data[field] = value
    }
    out.push({ rowNumber: i + 2, data })
  })
  return out
}

/** A record → one row in the sheet's own column order. */
export function objectToRow(
  record: Record<string, unknown>,
  header: readonly Cell[],
  kinds: Record<string, FieldKind>
): (string | number | boolean)[] {
  const columns = columnMap(header, Object.keys(kinds))
  const row: (string | number | boolean)[] = Array.from({ length: header.length }, () => "")
  for (const [field, col] of columns) row[col] = toCell(kinds[field] ?? "text", record[field])
  return row
}

/** "A", "B" … "Z", "AA" for a 0-based column index. */
export function columnLetter(index: number): string {
  let n = index + 1
  let s = ""
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}
