import { ensureDatabase } from "@/server/db/local"

/**
 * Runs a script against the database: DATABASE_URL when set, else the local one (reusing a
 * running `pnpm dev`, or starting it just for the script). App modules that use the database must
 * be imported *inside* `body` (dynamic import), so they see the chosen DATABASE_URL.
 */
export async function withDatabase(body: (url: string) => Promise<void>) {
  const database = await ensureDatabase()
  process.env.DATABASE_URL = database.url
  try {
    await body(database.url)
  } finally {
    const { closeDb } = await import("@/server/db/client")
    await closeDb()
    await database.close()
  }
}
