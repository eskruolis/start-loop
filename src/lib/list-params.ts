import type { ListQuery } from "@/server/data/types"

/**
 * A list page's state lives in its URL (?q=, ?sort=date.desc, ?page=2), so every view can be
 * bookmarked, shared and reloaded. This turns those params into a safe ListQuery: unknown sort
 * fields and junk page numbers fall back to the defaults instead of reaching the database.
 */
export type SearchParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export function parseListParams(
  params: SearchParams,
  opts: { sortable: readonly string[]; pageSize?: number }
): ListQuery & { page: number } {
  const search = first(params.q)?.trim().slice(0, 100) || undefined
  const [field, dir] = (first(params.sort) ?? "").split(".")
  const sort =
    field && opts.sortable.includes(field)
      ? { field, dir: dir === "asc" ? ("asc" as const) : ("desc" as const) }
      : undefined
  const page = Math.max(1, Number.parseInt(first(params.page) ?? "1", 10) || 1)
  return { search, sort, page, pageSize: opts.pageSize ?? 25 }
}
