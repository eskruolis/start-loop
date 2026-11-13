/**
 * Checks that a Google Sheets tab can be used by a module, before you switch the module to it:
 * header columns found and missing, rows that fail validation (with the reason), rows without an id.
 *   pnpm sheets:check sales             # report only
 *   pnpm sheets:check sales --fix-ids   # write a new id into every row that has none
 */
import { randomUUID } from "node:crypto"
import { kindsOf } from "@/lib/fields"
import { readTab, writeCells } from "@/server/data/adapters/sheets"
import { columnLetter, columnMap, rowsToObjects } from "@/server/data/sheets-mapping"
import { moduleByKey, moduleKeys } from "./registry"

async function main() {
  const [key, ...flags] = process.argv.slice(2)
  const entity = moduleByKey(key)
  if (!entity) {
    console.error(
      `Usage: pnpm sheets:check <module> [--fix-ids]   modules: ${moduleKeys.join(", ")}`
    )
    process.exit(1)
  }
  const kinds = kindsOf(entity.schema)
  const tab = entity.sheet.tab
  const values = await readTab(tab)
  const header = values[0] ?? []
  const columns = columnMap(header, Object.keys(kinds))
  const missing = Object.keys(kinds).filter((f) => !columns.has(f))

  console.info(`Tab "${tab}": ${values.length - 1} data rows, ${header.length} columns`)
  console.info(`  fields found:   ${[...columns.keys()].join(", ") || "none"}`)
  if (missing.length)
    console.info(`  fields missing: ${missing.join(", ")} (add these headers to row 1)`)

  let bad = 0
  const noId: number[] = []
  for (const { rowNumber, data } of rowsToObjects(values, kinds)) {
    if (!data.id) noId.push(rowNumber)
    const parsed = entity.schema.safeParse(data)
    if (!parsed.success) {
      bad++
      if (bad <= 20) {
        const issue = parsed.error.issues[0]
        console.info(`  row ${rowNumber}: ${issue?.path.join(".")} ${issue?.message}`)
      }
    }
  }
  console.info(`  rows that fail validation: ${bad}${bad > 20 ? " (first 20 shown)" : ""}`)
  console.info(`  rows without an id: ${noId.length}`)

  if (flags.includes("--fix-ids") && noId.length) {
    const col = columns.get("id")
    if (col === undefined) throw new Error('Add an "id" column header first')
    const letter = columnLetter(col)
    for (const row of noId) await writeCells(tab, `${letter}${row}`, [[randomUUID()]])
    console.info(`  wrote ids into ${noId.length} rows`)
  }
  process.exit(bad || missing.length ? 1 : 0)
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
