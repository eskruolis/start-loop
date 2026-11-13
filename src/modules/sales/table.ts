import { date, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { SALE_STATUSES } from "./schema"

/** Sales in Postgres. Column names match the schema's fields (snake_case in SQL). */
export const sales = pgTable(
  "sales",
  {
    id: text().primaryKey(),
    date: date({ mode: "string" }).notNull(),
    customer: text().notNull(),
    product: text().notNull(),
    category: text().notNull().default(""),
    quantity: integer().notNull().default(1),
    /** Cents. */
    amount: integer().notNull(),
    status: text({ enum: SALE_STATUSES }).notNull().default("draft"),
    notes: text().notNull().default(""),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.date), index().on(t.status), index().on(t.customer)]
)
