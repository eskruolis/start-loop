/**
 * Applies the migrations in ./drizzle: to DATABASE_URL when set (production), else to the local
 * database. `pnpm dev` already does this at start; run it yourself after `pnpm db:generate`,
 * and in the deploy step for production.
 */
import { runMigrations } from "./lib/migrations"
import { withDatabase } from "./lib/with-database"

withDatabase(async (url) => {
  await runMigrations(url)
  console.info(
    process.env.DATABASE_URL?.includes("127.0.0.1")
      ? "Migrations applied to the local database"
      : "Migrations applied"
  )
}).catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exitCode = 1
})
