import type { NextConfig } from "next"
import "./src/server/env"

/** Security headers on every response; search engines kept out (an ERP is private). */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
]

const nextConfig: NextConfig = {
  // The end-to-end tests run their own dev server; its own folder keeps it from fighting `pnpm dev`
  // (two dev servers writing one .next folder reload each other's pages endlessly).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  // Native/binary packages that must stay out of the bundle.
  serverExternalPackages: ["@electric-sql/pglite", "embedded-postgres"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
