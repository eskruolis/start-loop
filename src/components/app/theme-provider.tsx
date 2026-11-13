"use client"

import { ThemeProvider as NextThemes } from "next-themes"
import type { ReactNode } from "react"

/** Light, dark or the system's choice; stored in the browser, applied before first paint (no flash). */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemes>
  )
}
