import { defineConfig } from "drizzle-kit"

/**
 * `pnpm db:generate` turns schema changes into a SQL migration in ./drizzle (no database needed).
 * `pnpm db:studio` browses DATABASE_URL, or the local database while `pnpm dev` (or
 * `pnpm db:server`) is running.
 */
export default defineConfig({
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:54329/postgres",
  },
  casing: "snake_case",
  strict: true,
  verbose: true,
})
