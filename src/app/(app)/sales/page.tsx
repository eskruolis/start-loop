import { PageHeader } from "@/components/app/page-header"
import type { SearchParams } from "@/lib/list-params"
import { SalesTable } from "@/modules/sales/components/sales-table"
import { listSales } from "@/modules/sales/queries"

export const metadata = { title: "Sales" }

export default async function SalesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { query, result } = await listSales(await searchParams)
  return (
    <>
      <PageHeader title="Sales" description="Every sale, its customer and status." />
      <SalesTable page={result} sort={query.sort} search={query.search} />
    </>
  )
}
