import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * The one way to show a state (paid, pending, cancelled…). Map each module's statuses to a tone
 * once (see the sales table) instead of picking colours in place.
 */
const tones = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground",
        info: "bg-info text-info-foreground",
        success: "bg-success text-success-foreground",
        warning: "bg-warning text-warning-foreground",
        danger: "bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

export type Tone = NonNullable<VariantProps<typeof tones>["tone"]>

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: Tone
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={cn(tones({ tone }), className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  )
}
