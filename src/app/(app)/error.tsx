"use client"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

/** When a page fails (database down, sheet unreachable), say so plainly and offer a retry. */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>This page could not load</EmptyTitle>
        <EmptyDescription>
          {process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong on our side. Try again in a moment."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={reset}>Try again</Button>
      </EmptyContent>
    </Empty>
  )
}
