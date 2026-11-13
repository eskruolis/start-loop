/**
 * Runs only the local database (no app), for `pnpm db:studio` or a SQL client:
 * postgres://postgres:postgres@127.0.0.1:54329/postgres. Ctrl+C stops it.
 */
import { startLocalDatabase } from "@/server/db/local"

startLocalDatabase()
  .then((db) => {
    console.info(`Local database on ${db.url} (Ctrl+C to stop)`)
    const stop = () => void db.stop().then(() => process.exit(0))
    process.on("SIGINT", stop)
    process.on("SIGTERM", stop)
  })
  .catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  })
