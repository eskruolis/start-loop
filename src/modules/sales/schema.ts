import { z } from "zod"
import { fields } from "@/lib/fields"

/**
 * A sale, as the whole app sees it. This schema is the single source of truth: the TypeScript
 * type, form validation, the server action's check, the Postgres row and the Sheets columns all
 * come from it. Safe to import in the browser (no server code here).
 */
export const SALE_STATUSES = ["draft", "sent", "paid", "cancelled"] as const
export type SaleStatus = (typeof SALE_STATUSES)[number]

export const saleSchema = z.object({
  id: fields.id(),
  date: fields.date(),
  customer: fields.requiredText({ max: 200 }),
  product: fields.requiredText({ max: 200 }),
  category: fields.text({ max: 100 }),
  quantity: fields.number({ int: true, min: 1 }),
  /** Total for the line, in cents. */
  amount: fields.money({ min: 0 }),
  status: fields.enumOf(SALE_STATUSES),
  notes: fields.text({ max: 2000 }),
})

/** What a user enters to create or edit a sale. */
export const saleInputSchema = saleSchema.omit({ id: true })

export type Sale = z.output<typeof saleSchema>
export type SaleInput = z.output<typeof saleInputSchema>
/** The form's values before validation (text fields with defaults may be missing). */
export type SaleFormValues = z.input<typeof saleInputSchema>

/** The columns a list can be sorted by (also what `?sort=` accepts). */
export const SALE_SORTABLE = ["date", "customer", "product", "amount", "status"] as const
