import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="ml-auto h-9 w-28" />
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}
