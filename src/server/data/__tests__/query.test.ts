import { describe, expect, it } from "vitest"
import { applyQuery, paging } from "../query"

const rows = [
  { id: "1", name: "Bravo", amount: 10 },
  { id: "2", name: "alpha", amount: 30 },
  { id: "3", name: "Charlie", amount: 20 },
]

describe("applyQuery", () => {
  it("searches case-insensitively in the searchable fields only", () => {
    expect(applyQuery(rows, { search: "ALP" }, ["name"]).rows.map((r) => r.id)).toEqual(["2"])
    expect(applyQuery(rows, { search: "30" }, ["name"]).total).toBe(0)
  })

  it("sorts text naturally and numbers numerically", () => {
    expect(
      applyQuery(rows, { sort: { field: "name", dir: "asc" } }, []).rows.map((r) => r.name)
    ).toEqual(["alpha", "Bravo", "Charlie"])
    expect(
      applyQuery(rows, { sort: { field: "amount", dir: "desc" } }, []).rows.map((r) => r.amount)
    ).toEqual([30, 20, 10])
  })

  it("pages and reports the total before paging", () => {
    const page = applyQuery(rows, { page: 2, pageSize: 2 }, [])
    expect(page).toMatchObject({ total: 3, page: 2, pageSize: 2 })
    expect(page.rows).toHaveLength(1)
  })

  it("clamps junk paging values", () => {
    expect(paging({ page: -3, pageSize: 99999 })).toEqual({ page: 1, pageSize: 200, offset: 0 })
  })
})
