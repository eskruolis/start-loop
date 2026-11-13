import { describe, expect, it } from "vitest"
import type { Sale } from "../schema"
import { lastMonths, salesStats } from "../stats"

const sale = (over: Partial<Sale>): Sale => ({
  id: crypto.randomUUID(),
  date: "2026-11-01",
  customer: "A",
  product: "P",
  category: "Services",
  quantity: 1,
  amount: 1000,
  status: "paid",
  notes: "",
  ...over,
})

describe("salesStats", () => {
  it("counts sent and paid as revenue, never drafts or cancelled", () => {
    const s = salesStats(
      [
        sale({ amount: 1000 }),
        sale({ amount: 500, status: "sent" }),
        sale({ amount: 9999, status: "draft" }),
        sale({ amount: 7777, status: "cancelled" }),
      ],
      "2026-11-13"
    )
    expect(s.revenueCents).toBe(1500)
    expect(s.openCents).toBe(500)
    expect(s.count).toBe(2)
    expect(s.averageCents).toBe(750)
  })

  it("buckets revenue into the last 12 months, oldest first", () => {
    const s = salesStats([sale({ date: "2026-11-02" }), sale({ date: "2025-01-05" })], "2026-11-13")
    expect(s.byMonth).toHaveLength(12)
    expect(s.byMonth.at(-1)).toEqual({ month: "2026-11", amountCents: 1000 })
    expect(s.byMonth.reduce((sum, m) => sum + m.amountCents, 0)).toBe(1000)
  })

  it("keeps the top categories and folds the rest into Other", () => {
    const rows = ["a", "b", "c"].map((c, i) => sale({ category: c, amount: (i + 1) * 100 }))
    expect(salesStats(rows, "2026-11-13", 12, 2).byCategory).toEqual([
      { category: "c", amountCents: 300 },
      { category: "b", amountCents: 200 },
      { category: "Other", amountCents: 100 },
    ])
  })

  it("lists months across a year boundary", () => {
    expect(lastMonths("2026-02-10", 3)).toEqual(["2025-12", "2026-01", "2026-02"])
  })
})
