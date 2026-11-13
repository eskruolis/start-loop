import { existsSync, readFileSync } from "node:fs"
import { createConnection } from "node:net"
import { homedir } from "node:os"
import { join } from "node:path"
import EmbeddedPostgres from "embedded-postgres"

/**
 * The local database for development: a real Postgres server (embedded-postgres ships the
 * binaries as an npm package: no Docker, no install), started by `pnpm dev` on a local port.
 * Next.js, its worker processes and every script connect to it exactly as they connect to
 * production Postgres.
 *
 * Learned the hard way:
 * - The data folder lives OUTSIDE the project (~/.start-loop/<package name>/postgres). Next's
 *   file watcher sees every change inside the project, and a database writes on every request:
 *   inside the project it reloaded the page in an endless loop.
 * - Next's dev server runs several processes, so an in-process database (PGlite) cannot be shared
 *   by them; PGlite's socket server mixes up overlapping queries (Postgres error 08P01). A real
 *   server has neither problem. PGlite is still used for unit tests (one process, in memory).
 */
export const LOCAL_DB_PORT = Number(process.env.LOCAL_DB_PORT || 54329)
export const localDatabaseUrl = (port = LOCAL_DB_PORT) =>
  `postgres://postgres:postgres@127.0.0.1:${port}/postgres`

export function defaultDataDir(): string {
  const override = process.env.LOCAL_DB_DIR?.trim()
  if (override) return override
  let name = "start-loop"
  try {
    name = (JSON.parse(readFileSync("package.json", "utf8")) as { name?: string }).name ?? name
  } catch {
    // No package.json in the working directory: keep the default name.
  }
  return join(homedir(), ".start-loop", name.replace(/[^\w.-]/g, "_"), "postgres")
}

/** Is something listening on the local database port? */
export function isListening(port = LOCAL_DB_PORT): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ host: "127.0.0.1", port })
    socket.once("connect", () => {
      socket.end()
      resolve(true)
    })
    socket.once("error", () => resolve(false))
  })
}

/** Starts Postgres on the local port (creating the data folder on first run). */
export async function startLocalDatabase(dir = defaultDataDir(), port = LOCAL_DB_PORT) {
  const pg = new EmbeddedPostgres({
    databaseDir: dir,
    port,
    user: "postgres",
    password: "postgres",
    persistent: true,
    onLog: () => {},
    onError: (e: unknown) => {
      const text = e instanceof Error ? e.message : String(e)
      // Postgres writes routine notices to stderr; only pass real problems on.
      if (/error|fatal|panic/i.test(text)) console.error(`[postgres] ${text.trim()}`)
    },
  })
  if (!existsSync(join(dir, "PG_VERSION"))) await pg.initialise()
  await pg.start()
  return { url: localDatabaseUrl(port), stop: () => pg.stop() }
}

/**
 * A database URL for scripts: DATABASE_URL when set, else the running local server (`pnpm dev`),
 * else a local server started just for this script (stopped by `close`).
 */
export async function ensureDatabase() {
  const configured = process.env.DATABASE_URL?.trim()
  if (configured) return { url: configured, close: async () => {} }
  if (await isListening()) return { url: localDatabaseUrl(), close: async () => {} }
  const started = await startLocalDatabase()
  return { url: started.url, close: started.stop }
}
