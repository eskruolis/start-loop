import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { env } from "../env"
import * as schema from "./schema"

/**
 * One database handle for the whole app, always over the normal Postgres protocol: production
 * Postgres (Neon, Supabase, Railway…) or the local server `pnpm dev` starts (see local.ts), which
 * puts its address in DATABASE_URL. Opened on first use and kept on globalThis, so hot reload
 * never opens a second pool.
 */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>

declare global {
  var __startLoopDb: Db | undefined
  var __startLoopSql: postgres.Sql | undefined
}

function open(): Db {
  if (!env.DATABASE_URL) {
    throw new Error(
      "No database: start the app with `pnpm dev` (it starts the local database) or set DATABASE_URL."
    )
  }
  return drizzle(postgres(env.DATABASE_URL, { max: 10, prepare: false }), {
    schema,
    casing: "snake_case",
  })
}

export function db(): Db {
  globalThis.__startLoopDb ??= open()
  return globalThis.__startLoopDb
}

/** Closes the connection pool (scripts call this so they can exit cleanly). */
export async function closeDb() {
  await globalThis.__startLoopSql?.end({ timeout: 5 })
  globalThis.__startLoopSql = undefined
  globalThis.__startLoopDb = undefined
}

/** For tests: use this handle (an in-memory PGlite) instead of connecting. */
export function setDbForTests(handle: Db) {
  globalThis.__startLoopDb = handle
}
