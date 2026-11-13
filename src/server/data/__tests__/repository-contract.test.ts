import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"
import { salesEntity } from "@/modules/sales/entity"
import type { SaleInput } from "@/modules/sales/schema"
import { repo } from "@/server/data"
import { resetMemory } from "@/server/data/adapters/memory"
import { setDbForTests } from "@/server/db/client"
import * as schema from "@/server/db/schema"

/**
 * Every data source must behave the same. This suite runs the same checks against the memory
 * store and a real (in-memory) Postgres. A new adapter is done when it passes here too.
 */
const sale = (over: Partial<SaleInput> = {}): SaleInput => ({
  date: "2026-11-01",
  customer: "Acme Ltd",
  product: "Desk",
  category: "Furniture",
  quantity: 1,
  amount: 42000,
  status: "paid",
  notes: "",
  ...over,
})

let pg: PGlite
beforeAll(async () => {
  pg = new PGlite()
  const handle = drizzle(pg, { schema, casing: "snake_case" })
  await migrate(handle, { migrationsFolder: "./drizzle" })
  setDbForTests(handle)
})

for (const source of ["memory", "postgres"] as const) {
  describe(`${source} repository`, () => {
    const sales = () => repo(salesEntity, source)

    beforeEach(async () => {
      resetMemory()
      await pg.exec("delete from sales")
    })

    it("creates, reads, updates and removes", async () => {
      const created = await sales().create(sale())
      expect(created.id).toBeTruthy()
      expect(await sales().get(created.id)).toMatchObject({ customer: "Acme Ltd", amount: 42000 })

      const updated = await sales().update(created.id, { status: "cancelled", amount: 100 })
      expect(updated).toMatchObject({ status: "cancelled", amount: 100, customer: "Acme Ltd" })

      await sales().remove(created.id)
      expect(await sales().get(created.id)).toBeNull()
    })

    it("searches, filters, sorts and pages the same way", async () => {
      await sales().create(sale({ customer: "Acme Ltd", amount: 300, date: "2026-01-03" }))
      await sales().create(
        sale({ customer: "Blue Harbour", amount: 100, date: "2026-01-01", status: "draft" })
      )
      await sales().create(sale({ customer: "Casa Verde", amount: 200, date: "2026-01-02" }))

      const byAmount = await sales().list({ sort: { field: "amount", dir: "asc" } })
      expect(byAmount.rows.map((r) => r.amount)).toEqual([100, 200, 300])
      expect(byAmount.total).toBe(3)

      const defaultSort = await sales().list()
      expect(defaultSort.rows.map((r) => r.date)).toEqual([
        "2026-01-03",
        "2026-01-02",
        "2026-01-01",
      ])

      expect((await sales().list({ search: "harb" })).rows.map((r) => r.customer)).toEqual([
        "Blue Harbour",
      ])
      expect((await sales().list({ filters: { status: "draft" } })).total).toBe(1)

      const page2 = await sales().list({
        sort: { field: "amount", dir: "asc" },
        page: 2,
        pageSize: 2,
      })
      expect(page2.rows.map((r) => r.amount)).toEqual([300])
      expect(page2.total).toBe(3)
    })

    it("rejects invalid input before it is stored", async () => {
      await expect(sales().create(sale({ customer: "" }))).rejects.toThrow()
      await expect(sales().create(sale({ amount: 12.5 }))).rejects.toThrow()
      expect((await sales().list()).total).toBe(0)
    })
  })
}
