import { app } from "@/config/app"

/** "2026-11-13" → "13 Nov 2026". Business dates have no time zone, so UTC keeps the day intact. */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat(app.locale, { dateStyle: "medium", timeZone: "UTC" }).format(d)
}

/** "2026-11" → "Nov 2026". */
export function formatMonth(month: string): string {
  const d = new Date(`${month}-01T00:00:00Z`)
  return new Intl.DateTimeFormat(app.locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d)
}

export function formatNumber(n: number, digits = 0): string {
  return new Intl.NumberFormat(app.locale, { maximumFractionDigits: digits }).format(n)
}

/** Today's date in the business time zone (not the server's), as "YYYY-MM-DD". */
export function todayIso(now: Date = new Date(), timeZone: string = app.timeZone): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}
