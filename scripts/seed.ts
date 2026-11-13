/**
 * Fills the sales module with believable demo data, so the dashboard has something to show.
 * Refuses to write to Google Sheets (that is real data) unless you pass --force.
 *   pnpm db:seed            # 120 sales over the last 12 months
 *   pnpm db:seed -- --count 30
 */
import { todayIso } from "@/lib/format"
import type { SaleInput } from "@/modules/sales/schema"
import { lastMonths } from "@/modules/sales/stats"
import { withDatabase } from "./lib/with-database"

const CUSTOMERS = [
  "Acme Ltd",
  "Blue Harbour",
  "Casa Verde",
  "Delta Foods",
  "Evergreen Co",
  "Fjord Studio",
  "Granite & Sons",
  "Helios Energy",
]
const PRODUCTS: [string, string, number][] = [
  ["Consulting hour", "Services", 9000],
  ["Website care plan", "Services", 4900],
  ["Office chair", "Furniture", 18900],
  ["Standing desk", "Furniture", 42000],
  ["Laptop stand", "Accessories", 3900],
  ['Monitor 27"', "Hardware", 25900],
  ["Training day", "Training", 79000],
]
const STATUSES = ["paid", "paid", "paid", "sent", "sent", "draft", "cancelled"] as const

/** A small seeded random generator: the same demo data on every run. */
function random(seed: number) {
  let state = seed
  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648
    return state / 2_147_483_648
  }
}

function pick<T>(list: readonly T[], r: number): T {
  const item = list[Math.floor(r * list.length)]
  if (item === undefined) throw new Error("empty list")
  return item
}

async function main() {
  // Imported here, after withDatabase chose the database (scripts/lib/with-database.ts).
  const { repo } = await import("@/server/data")
  const { dataSourceFor } = await import("@/server/env")
  const { salesEntity } = await import("@/modules/sales/entity")
  const args = process.argv.slice(2)
  const count = Number(args[args.indexOf("--count") + 1]) || 120
  const source = dataSourceFor(salesEntity.key)
  if (source === "sheets" && !args.includes("--force")) {
    throw new Error(
      "Sales are read from Google Sheets: seeding would add demo rows to your real sheet. Use --force if you mean it."
    )
  }
  const today = todayIso()
  const months = lastMonths(today, 12)
  const sales = repo(salesEntity)
  const rnd = random(42)
  for (let i = 0; i < count; i++) {
    const [product, category, price] = pick(PRODUCTS, rnd())
    const quantity = 1 + Math.floor(rnd() * 4)
    const month = pick(months, i / count)
    // The current month only up to today: demo sales are never in the future.
    const lastDay = month === today.slice(0, 7) ? Number(today.slice(8, 10)) : 28
    const day = String(1 + Math.floor(rnd() * lastDay)).padStart(2, "0")
    const input: SaleInput = {
      date: `${month}-${day}`,
      customer: pick(CUSTOMERS, rnd()),
      product,
      category,
      quantity,
      amount: price * quantity,
      status: pick(STATUSES, rnd()),
      notes: "",
    }
    await sales.create(input)
  }
  console.info(`Added ${count} demo sales (${source}).`)
}

withDatabase(main).catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
