import { Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/** A headline number with a hover hint that says exactly what it counts. */
export function KpiCard({
  label,
  value,
  hint,
  detail,
}: {
  label: string
  value: string
  hint: string
  detail?: string
}) {
  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          {label}
          <Tooltip>
            <TooltipTrigger
              aria-label={`What is ${label}?`}
              className="text-muted-foreground/70 hover:text-foreground"
            >
              <Info className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent className="max-w-64">{hint}</TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {detail ? <span className="text-xs text-muted-foreground">{detail}</span> : null}
      </CardContent>
    </Card>
  )
}
