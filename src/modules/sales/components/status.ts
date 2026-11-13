import type { Tone } from "@/components/app/status-badge"
import type { SaleStatus } from "../schema"

/** How each sale status reads and looks. One map, used by the table, the form and the charts. */
export const STATUS_LABEL: Record<SaleStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  cancelled: "Cancelled",
}

export const STATUS_TONE: Record<SaleStatus, Tone> = {
  draft: "neutral",
  sent: "info",
  paid: "success",
  cancelled: "danger",
}
