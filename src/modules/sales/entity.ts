import { defineEntity } from "@/server/data/types"
import { saleInputSchema, saleSchema } from "./schema"
import { sales } from "./table"

/** How sales are stored: Postgres table `sales`, Google Sheets tab "Sales", or memory. */
export const salesEntity = defineEntity({
  key: "sales",
  label: "Sales",
  schema: saleSchema,
  input: saleInputSchema,
  searchable: ["customer", "product", "category", "notes"],
  defaultSort: { field: "date", dir: "desc" },
  sheet: { tab: "Sales" },
  table: sales,
})
