import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

/** Applies the migrations in ./drizzle to the database at `url`. Applied ones are skipped. */
export async function runMigrations(url: string) {
  const client = postgres(url, { max: 1, onnotice: () => {} })
  try {
    await migrate(drizzle(client), { migrationsFolder: "./drizzle" })
  } finally {
    await client.end()
  }
}
