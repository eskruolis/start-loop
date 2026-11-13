import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { count } from "drizzle-orm"
import { db } from "./db/client"
import * as schema from "./db/schema"
import { env } from "./env"

/**
 * Sign-in with email and password (Better Auth). Users, sessions and accounts always live in
 * Postgres, whatever data source the modules use. The first account created becomes "admin";
 * everyone after that is a "member" until an admin changes their role.
 */
export const ROLES = ["admin", "member"] as const
export type Role = (typeof ROLES)[number]

function createAuth() {
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db(), { provider: "pg", schema }),
    emailAndPassword: { enabled: true, minPasswordLength: 10 },
    user: {
      additionalFields: {
        role: { type: "string", defaultValue: "member", input: false },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const [row] = await db().select({ n: count() }).from(schema.user)
            return { data: { ...user, role: (row?.n ?? 0) === 0 ? "admin" : "member" } }
          },
        },
      },
    },
    // Must stay last: lets server actions set the session cookie.
    plugins: [nextCookies()],
  })
}

declare global {
  var __startLoopAuth: ReturnType<typeof createAuth> | undefined
}

/**
 * Created on first use, not when the file loads: `next build` loads every route without a
 * database, and creating it eagerly opened one.
 */
export function auth() {
  globalThis.__startLoopAuth ??= createAuth()
  return globalThis.__startLoopAuth
}
