import { Skeleton } from "@/components/ui/skeleton"

/** Shown the instant a link is clicked, while the next page loads (an ERP must feel immediate). */
export default function Loading() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-80" />
    </div>
  )
}
