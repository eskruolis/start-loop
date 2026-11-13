/**
 * Business settings in one place. Money, dates and numbers are formatted from these, so changing
 * the currency or locale here changes it everywhere.
 */
export const app = {
  name: "Start Loop",
  /** Language and number/date format (BCP 47), e.g. "en-GB", "de-DE", "lt-LT". */
  locale: "en-GB",
  /** ISO 4217 code; amounts are stored in its minor unit (cents). */
  currency: "EUR",
  /** "Today" and day boundaries are counted in this time zone, not the server's. */
  timeZone: "Europe/Madrid",
} as const
