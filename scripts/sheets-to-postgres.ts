/**
 * Copies one module's records from Google Sheets into Postgres, keeping their ids, so the module
 * can switch to Postgres (set DATA_SOURCE_<MODULE>=postgres afterwards). Safe to run again:
 * records already in Postgres are updated, not duplicated. Dry run by default.
 *   pnpm sheets:copy sales           # show what would happen
 *   pnpm sheets:copy sales --apply   # do it
 */
import { eq, getTableColumns } from "drizzle-orm"
import { withDatabase } from "./lib/with-database"
import { moduleByKey, moduleKeys } from "./registry"

async function main() {
  const [key, ...flags] = process.argv.slice(2)
  const entity = moduleByKey(key)
  if (!entity) {
    throw new Error(
      `Usage: pnpm sheets:copy <module> [--apply]   modules: ${moduleKeys.join(", ")}`
    )
  }
  const apply = flags.includes("--apply")
  // Imported here, after withDatabase chose the database.
  const { db } = await import("@/server/db/client")
  const { repo } = await import("@/server/data")
  const rows = await repo(entity, "sheets").all()
  const table = entity.table
  const idColumn = getTableColumns(table).id
  if (!idColumn) throw new Error(`${entity.label}: the table has no id column`)

  let created = 0
  let updated = 0
  for (const row of rows) {
    const [existing] = await db()
      .select({ id: idColumn })
      .from(table)
      .where(eq(idColumn, row.id))
      .limit(1)
    if (existing) updated++
    else created++
    if (!apply) continue
    if (existing) await db().update(table).set(row).where(eq(idColumn, row.id))
    else await db().insert(table).values(row)
  }
  console.info(
    `${entity.label}: ${rows.length} rows in the sheet → ${created} new, ${updated} existing ${apply ? "copied" : "(dry run, add --apply)"}`
  )
  if (apply)
    console.info(`Next: set DATA_SOURCE_${entity.key.toUpperCase()}=postgres and restart the app.`)
}

withDatabase(main).catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exitCode = 1
})
