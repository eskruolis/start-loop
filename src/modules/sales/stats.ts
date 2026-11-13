import type { Sale, SaleStatus } from "./schema"

/**
 * Dashboard numbers from a list of sales. Pure, so it is unit-tested and works the same whether
 * the sales came from Postgres or Google Sheets. "Revenue" counts every sale that is not a draft
 * or cancelled.
 */
export type SalesStats = {
  revenueCents: number
  openCents: number
  count: number
  averageCents: number
  byStatus: { status: SaleStatus; count: number; amountCents: number }[]
  byMonth: { month: string; amountCents: number }[]
  byCategory: { category: string; amountCents: number }[]
}

const COUNTS_AS_REVENUE: readonly SaleStatus[] = ["sent", "paid"]

/** The last `n` months up to the month of `today`, as "YYYY-MM", oldest first. */
export function lastMonths(today: string, n: number): string[] {
  const [y, m] = today.split("-").map(Number)
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1 - i, 1))
    out.push(d.toISOString().slice(0, 7))
  }
  return out
}

export function salesStats(
  rows: readonly Sale[],
  today: string,
  months = 12,
  topCategories = 5
): SalesStats {
  const revenue = rows.filter((s) => COUNTS_AS_REVENUE.includes(s.status))
  const revenueCents = revenue.reduce((sum, s) => sum + s.amount, 0)
  const openCents = rows.filter((s) => s.status === "sent").reduce((sum, s) => sum + s.amount, 0)

  const statuses: SaleStatus[] = ["draft", "sent", "paid", "cancelled"]
  const byStatus = statuses.map((status) => {
    const of = rows.filter((s) => s.status === status)
    return { status, count: of.length, amountCents: of.reduce((sum, s) => sum + s.amount, 0) }
  })

  const monthTotals = new Map(lastMonths(today, months).map((m) => [m, 0]))
  for (const s of revenue) {
    const month = s.date.slice(0, 7)
    if (monthTotals.has(month)) monthTotals.set(month, (monthTotals.get(month) ?? 0) + s.amount)
  }

  const categoryTotals = new Map<string, number>()
  for (const s of revenue) {
    const key = s.category || "Uncategorised"
    categoryTotals.set(key, (categoryTotals.get(key) ?? 0) + s.amount)
  }
  const sorted = [...categoryTotals].sort((a, b) => b[1] - a[1])
  const top = sorted
    .slice(0, topCategories)
    .map(([category, amountCents]) => ({ category, amountCents }))
  const rest = sorted.slice(topCategories).reduce((sum, [, v]) => sum + v, 0)
  if (rest > 0) top.push({ category: "Other", amountCents: rest })

  return {
    revenueCents,
    openCents,
    count: revenue.length,
    averageCents: revenue.length ? Math.round(revenueCents / revenue.length) : 0,
    byStatus,
    byMonth: [...monthTotals].map(([month, amountCents]) => ({ month, amountCents })),
    byCategory: top,
  }
}
