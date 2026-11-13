"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus, ReceiptText } from "lucide-react"
import { DataTable } from "@/components/app/data-table"
import { StatusBadge } from "@/components/app/status-badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { formatDate } from "@/lib/format"
import { formatMoney } from "@/lib/money"
import type { Page } from "@/server/data/types"
import type { Sale } from "../schema"
import { DeleteSaleButton } from "./delete-sale-button"
import { SaleFormDialog } from "./sale-form-dialog"
import { STATUS_LABEL, STATUS_TONE } from "./status"

const columns: ColumnDef<Sale>[] = [
  {
    accessorKey: "date",
    header: "Date",
    meta: { sortField: "date" },
    cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.date)}</span>,
  },
  {
    accessorKey: "customer",
    header: "Customer",
    meta: { sortField: "customer" },
    cell: ({ row }) => (
      <div className="flex max-w-56 flex-col">
        <span className="truncate font-medium">{row.original.customer}</span>
        <span className="truncate text-xs text-muted-foreground md:hidden">
          {row.original.product}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "product",
    header: "Product",
    meta: { sortField: "product", hideBelow: "md" },
    cell: ({ row }) => (
      <div className="flex max-w-64 flex-col">
        <span className="truncate">{row.original.product}</span>
        {row.original.category ? (
          <span className="truncate text-xs text-muted-foreground">{row.original.category}</span>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Total",
    meta: { sortField: "amount", align: "right" },
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">{formatMoney(row.original.amount)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { sortField: "status", hideBelow: "sm" },
    cell: ({ row }) => (
      <StatusBadge tone={STATUS_TONE[row.original.status]}>
        {STATUS_LABEL[row.original.status]}
      </StatusBadge>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    meta: { align: "right" },
    cell: ({ row }) => {
      const label = `${row.original.customer}, ${formatDate(row.original.date)}`
      return (
        <div className="flex justify-end gap-1">
          <SaleFormDialog
            sale={row.original}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${label}`}>
                <Pencil />
              </Button>
            }
          />
          <DeleteSaleButton id={row.original.id} label={label} />
        </div>
      )
    },
  },
]

export function SalesTable({
  page,
  sort,
  search,
}: {
  page: Page<Sale>
  sort?: { field: string; dir: "asc" | "desc" }
  search?: string
}) {
  const newSale = (
    <SaleFormDialog
      trigger={
        <Button>
          <Plus /> New sale
        </Button>
      }
    />
  )
  return (
    <DataTable
      columns={columns}
      rows={page.rows}
      total={page.total}
      page={page.page}
      pageSize={page.pageSize}
      sort={sort}
      search={search}
      searchPlaceholder="Search customer, product, notes…"
      toolbar={newSale}
      empty={
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptText />
            </EmptyMedia>
            <EmptyTitle>{search ? "No sales match" : "No sales yet"}</EmptyTitle>
            <EmptyDescription>
              {search
                ? `Nothing found for “${search}”.`
                : "Add the first sale, or connect your Google Sheet."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
    />
  )
}
