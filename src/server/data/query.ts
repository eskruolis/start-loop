import type { ListQuery, Page } from "./types"

export const DEFAULT_PAGE_SIZE = 25
export const MAX_PAGE_SIZE = 200

/** Page number and size, clamped to sane values. */
export function paging(query: ListQuery = {}) {
  const pageSize = Math.min(
    Math.max(Math.trunc(query.pageSize ?? DEFAULT_PAGE_SIZE), 1),
    MAX_PAGE_SIZE
  )
  const page = Math.max(Math.trunc(query.page ?? 1), 1)
  return { page, pageSize, offset: (page - 1) * pageSize }
}

function compare(a: unknown, b: unknown): number {
  if (a === b) return 0
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1
  if (typeof a === "number" && typeof b === "number") return a - b
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b)
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" })
}

/**
 * Search, filter, sort and page a list in memory. Used by the Sheets and memory adapters, so a
 * module behaves the same wherever its data lives. Postgres does the same work in SQL.
 */
export function applyQuery<T extends Record<string, unknown>>(
  rows: readonly T[],
  query: ListQuery,
  searchable: readonly string[]
): Page<T> {
  const needle = query.search?.trim().toLowerCase()
  let out = rows.filter((row) => {
    if (
      needle &&
      !searchable.some((f) =>
        String(row[f] ?? "")
          .toLowerCase()
          .includes(needle)
      )
    )
      return false
    for (const [field, value] of Object.entries(query.filters ?? {})) {
      if (String(row[field]) !== String(value)) return false
    }
    return true
  })
  if (query.sort) {
    const { field, dir } = query.sort
    const sign = dir === "desc" ? -1 : 1
    out = [...out].sort((a, b) => sign * compare(a[field], b[field]))
  }
  const { page, pageSize, offset } = paging(query)
  return { rows: out.slice(offset, offset + pageSize), total: out.length, page, pageSize }
}
