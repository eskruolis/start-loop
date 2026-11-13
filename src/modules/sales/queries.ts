import "server-only"
import { todayIso } from "@/lib/format"
import { parseListParams, type SearchParams } from "@/lib/list-params"
import { repo } from "@/server/data"
import { salesEntity } from "./entity"
import { SALE_SORTABLE } from "./schema"
import { salesStats } from "./stats"

/** Reads for pages (Server Components). Writes live in actions.ts. */
export async function listSales(params: SearchParams) {
  const query = parseListParams(params, { sortable: SALE_SORTABLE })
  return { query, result: await repo(salesEntity).list(query) }
}

export async function salesDashboard() {
  const rows = await repo(salesEntity).all()
  return salesStats(rows, todayIso())
}
