/**
 * `pnpm dev`: starts the local Postgres (unless DATABASE_URL points elsewhere), applies
 * migrations, then runs `next dev` connected to it. Ctrl+C stops all of it.
 * Extra arguments go to Next: `pnpm dev -p 3100`.
 */
import { spawn } from "node:child_process"
import { defaultDataDir, isListening, LOCAL_DB_PORT, startLocalDatabase } from "@/server/db/local"
import { runMigrations } from "./lib/migrations"

async function main() {
  let url = process.env.DATABASE_URL?.trim()
  let stop = async () => {}
  if (!url) {
    if (await isListening()) {
      throw new Error(
        `Port ${LOCAL_DB_PORT} is busy: is another \`pnpm dev\` running? Stop it, or set LOCAL_DB_PORT.`
      )
    }
    const local = await startLocalDatabase()
    url = local.url
    stop = local.stop
    console.info(`Local database: ${defaultDataDir()} (port ${LOCAL_DB_PORT})`)
  }
  await runMigrations(url)

  const next = spawn("pnpm", ["exec", "next", "dev", ...process.argv.slice(2)], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  })
  let stopping = false
  const shutdown = async (code: number) => {
    if (stopping) return
    stopping = true
    await stop()
    process.exit(code)
  }
  process.on("SIGINT", () => next.kill("SIGINT"))
  process.on("SIGTERM", () => next.kill("SIGTERM"))
  next.on("exit", (code) => void shutdown(code ?? 0))
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
