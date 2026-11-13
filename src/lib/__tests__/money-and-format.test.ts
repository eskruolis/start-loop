import { describe, expect, it } from "vitest"
import { saleSchema } from "@/modules/sales/schema"
import { kindsOf } from "../fields"
import { formatDate, todayIso } from "../format"
import { parseListParams } from "../list-params"
import { centsToInput, parseMoney } from "../money"

describe("money", () => {
  it("understands the ways people type amounts", () => {
    expect(parseMoney("12,50")).toBe(1250)
    expect(parseMoney("1,234.50")).toBe(123450)
    expect(parseMoney("1.234,50 €")).toBe(123450)
    expect(parseMoney("1,234")).toBe(123400)
    expect(parseMoney("€ 7")).toBe(700)
    expect(parseMoney("abc")).toBeNull()
    expect(parseMoney(0.1 + 0.2)).toBe(30)
  })

  it("shows cents as input text", () => {
    expect(centsToInput(1250)).toBe("12.50")
    expect(centsToInput(undefined)).toBe("")
  })
})

describe("dates", () => {
  it("keeps the calendar day whatever the server's time zone", () => {
    expect(formatDate("2026-01-01")).toContain("2026")
    expect(formatDate("2026-01-01")).toContain("1")
  })

  it("counts today in the business time zone", () => {
    // 23:30 UTC on 31 Dec is already 1 Jan in Madrid.
    expect(todayIso(new Date("2026-12-31T23:30:00Z"), "Europe/Madrid")).toBe("2027-01-01")
    expect(todayIso(new Date("2026-12-31T23:30:00Z"), "America/New_York")).toBe("2026-12-31")
  })
})

describe("field kinds", () => {
  it("knows how each sale field is stored", () => {
    expect(kindsOf(saleSchema)).toMatchObject({
      id: "id",
      date: "date",
      amount: "money",
      quantity: "number",
      status: "enum",
      notes: "text",
    })
  })
})

describe("list params from the URL", () => {
  it("keeps only known sort fields and sane pages", () => {
    expect(
      parseListParams({ q: " acme ", sort: "amount.asc", page: "3" }, { sortable: ["amount"] })
    ).toMatchObject({
      search: "acme",
      sort: { field: "amount", dir: "asc" },
      page: 3,
    })
    expect(
      parseListParams({ sort: "password.asc", page: "-2" }, { sortable: ["amount"] })
    ).toMatchObject({ sort: undefined, page: 1 })
  })
})
