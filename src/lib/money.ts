import { app } from "@/config/app"

/** Cents → "€1,234.50" in the app's locale and currency. */
export function formatMoney(cents: number, currency: string = app.currency): string {
  return new Intl.NumberFormat(app.locale, { style: "currency", currency }).format(cents / 100)
}

/** Cents → "1234.50", the text a money input shows. */
export function centsToInput(cents: number | null | undefined): string {
  return cents === null || cents === undefined ? "" : (cents / 100).toFixed(2)
}

/**
 * Typed or pasted money → cents. Understands "1.234,50 €", "1,234.50", "12,5" and 12.5.
 * Null when the text holds no number.
 */
export function parseMoney(value: string | number | null | undefined): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? Math.round(value * 100) : null
  if (typeof value !== "string") return null
  let s = value.replace(/[^\d.,-]/g, "")
  if (!s) return null
  const lastComma = s.lastIndexOf(",")
  const lastDot = s.lastIndexOf(".")
  if (lastComma > -1 && lastDot > -1) {
    // Both present: the last one is the decimal separator.
    s = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "")
  } else if (lastComma > -1) {
    // Only commas: decimal when 1–2 digits follow at the end ("12,5"), else thousands.
    s = /,\d{1,2}$/.test(s) ? s.replace(",", ".") : s.replace(/,/g, "")
  }
  const n = Number(s)
  return Number.isFinite(n) ? Math.round(n * 100) : null
}
