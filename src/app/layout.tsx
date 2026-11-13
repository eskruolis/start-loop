import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/app/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { app } from "@/config/app"
import { cn } from "@/lib/utils"
import "./globals.css"

const sans = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: { default: app.name, template: `%s · ${app.name}` },
  // A private business tool: keep it out of search engines.
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={app.locale.split("-")[0]}
      suppressHydrationWarning
      className={cn(sans.variable, mono.variable)}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
