"use client"

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { type ReactNode, useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * The list view for every module: search, sortable columns and pages, all kept in the URL
 * (?q=&sort=field.dir&page=), so the server does the work and any view can be linked.
 * Mark a column sortable with `meta: { sortField: "amount" }`, right-align numbers with
 * `meta: { align: "right" }`.
 */
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    sortField?: string
    align?: "left" | "right"
    /** Hidden below this width, to keep phones readable. */
    hideBelow?: "sm" | "md" | "lg"
    // Keeps the generic parameters used, as TanStack requires.
    _types?: [TData, TValue]
  }
}

type Props<T> = {
  columns: ColumnDef<T>[]
  rows: T[]
  total: number
  page: number
  pageSize: number
  sort?: { field: string; dir: "asc" | "desc" }
  search?: string
  searchPlaceholder?: string
  empty: ReactNode
  toolbar?: ReactNode
}

const HIDE = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
} as const

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  total,
  page,
  pageSize,
  sort,
  search,
  searchPlaceholder,
  empty,
  toolbar,
}: Props<T>) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [text, setText] = useState(search ?? "")

  function navigate(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    const qs = next.toString()
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
  }

  // Search as you type, a moment after the last key.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on typing only; navigate is recreated each render
  useEffect(() => {
    if (text === (search ?? "")) return
    const t = setTimeout(() => navigate({ q: text.trim() || undefined, page: undefined }), 300)
    return () => clearTimeout(t)
  }, [text])

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  })
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const lastPage = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={searchPlaceholder ?? "Search…"}
            aria-label={searchPlaceholder ?? "Search"}
            className="pl-8"
            type="search"
          />
        </div>
        {toolbar ? <div className="ml-auto flex items-center gap-2">{toolbar}</div> : null}
      </div>

      <div
        className={cn("rounded-lg border transition-opacity", pending && "opacity-60")}
        aria-busy={pending}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta
                  const field = meta?.sortField
                  const active = field && sort?.field === field ? sort.dir : undefined
                  const label = flexRender(header.column.columnDef.header, header.getContext())
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        meta?.align === "right" && "text-right",
                        meta?.hideBelow && HIDE[meta.hideBelow]
                      )}
                      aria-sort={
                        active === "asc"
                          ? "ascending"
                          : active === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
                      {field ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("-mx-2 h-8", meta?.align === "right" && "ml-auto flex")}
                          onClick={() =>
                            navigate({
                              sort: `${field}.${active === "desc" ? "asc" : "desc"}`,
                              page: undefined,
                            })
                          }
                        >
                          {label}
                          {active === "asc" ? (
                            <ArrowUp />
                          ) : active === "desc" ? (
                            <ArrowDown />
                          ) : (
                            <ArrowUpDown className="opacity-40" />
                          )}
                        </Button>
                      ) : (
                        label
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          meta?.align === "right" && "text-right",
                          meta?.hideBelow && HIDE[meta.hideBelow]
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48">
                  {empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          {total === 0
            ? "No results"
            : `${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(total)}`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={page <= 1 || pending}
            onClick={() => navigate({ page: page - 1 > 1 ? String(page - 1) : undefined })}
          >
            <ChevronLeft />
          </Button>
          <span className="px-2 tabular-nums">
            {page} / {lastPage}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next page"
            disabled={page >= lastPage || pending}
            onClick={() => navigate({ page: String(page + 1) })}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
