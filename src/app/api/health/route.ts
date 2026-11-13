import { sql } from "drizzle-orm"
import { NextResponse } from "next/server"
import { modules } from "@/config/modules"
import { db } from "@/server/db/client"
import { dataSourceFor, sheetsCredentials } from "@/server/env"

/** Is the app up, can it reach its database, and where does each module read from? Never prints secrets. */
export const dynamic = "force-dynamic"

export async function GET() {
  let database = "ok"
  try {
    await db().execute(sql`select 1`)
  } catch (e) {
    database = e instanceof Error ? e.message : "error"
  }
  return NextResponse.json(
    {
      ok: database === "ok",
      database,
      sheetsConfigured: sheetsCredentials() !== null,
      sources: Object.fromEntries(modules.map((m) => [m.key, dataSourceFor(m.key)])),
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
