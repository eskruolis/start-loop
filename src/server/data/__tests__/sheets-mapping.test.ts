import { describe, expect, it } from "vitest"
import { kindsOf } from "@/lib/fields"
import { saleSchema } from "@/modules/sales/schema"
import {
  columnLetter,
  fromCell,
  objectToRow,
  parseBoolean,
  parseDate,
  rowsToObjects,
  toCell,
} from "../sheets-mapping"

describe("Sheets cells", () => {
  it("reads dates in every shape Sheets hands out", () => {
    expect(parseDate(46339)).toBe("2026-11-13") // serial number
    expect(parseDate("2026-11-13")).toBe("2026-11-13")
    expect(parseDate("13/11/2026")).toBe("2026-11-13")
    expect(parseDate("3.4.2026")).toBe("2026-04-03")
    expect(parseDate("not a date")).toBeNull()
  })

  it("reads money as cents and writes it back as a decimal", () => {
    expect(fromCell("money", 12.5)).toBe(1250)
    expect(fromCell("money", "1.234,50 €")).toBe(123450)
    expect(toCell("money", 123450)).toBe(1234.5)
  })

  it("reads ticked boxes and yes/no as booleans", () => {
    expect(parseBoolean(true)).toBe(true)
    expect(parseBoolean("Yes")).toBe(true)
    expect(parseBoolean("no")).toBe(false)
  })

  it("maps rows by header name, in any column order, skipping blank rows", () => {
    const kinds = kindsOf(saleSchema)
    const values = [
      ["Status", "id", "Customer", "Extra column", "amount", "date", "product", "quantity"],
      ["paid", "a1", "Acme", "ignored", 99.9, 46339, "Desk", 2],
      ["", "", "", "", "", "", "", ""],
      ["draft", "a2", "Blue", "", "10", "2026-01-02", "Chair", "1"],
    ]
    const out = rowsToObjects(values, kinds)
    expect(out.map((r) => r.rowNumber)).toEqual([2, 4])
    expect(out[0]?.data).toMatchObject({
      id: "a1",
      status: "paid",
      customer: "Acme",
      amount: 9990,
      date: "2026-11-13",
      quantity: 2,
    })
    expect(saleSchema.safeParse(out[1]?.data).success).toBe(true)
  })

  it("writes a record in the sheet's own column order, leaving unknown columns empty", () => {
    const kinds = kindsOf(saleSchema)
    const header = ["id", "Notes", "amount", "Mine"]
    expect(objectToRow({ id: "x", notes: "hi", amount: 500 }, header, kinds)).toEqual([
      "x",
      "hi",
      5,
      "",
    ])
  })

  it("names columns like Sheets does", () => {
    expect([0, 25, 26, 701].map(columnLetter)).toEqual(["A", "Z", "AA", "ZZ"])
  })
})
