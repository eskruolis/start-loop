import "server-only"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import { UserError } from "@/lib/result"
import { auth, type Role } from "./auth"

/**
 * The signed-in user, resolved once per request (React `cache`), so a layout and its page never
 * ask the database twice. The proxy only checks that a session cookie exists; this is the real
 * check, and every page and server action that touches data must call it.
 */
export type CurrentUser = { id: string; name: string; email: string; role: Role }

export const currentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth().api.getSession({ headers: await headers() })
  if (!session) return null
  const { id, name, email, role } = session.user
  return { id, name, email, role: role === "admin" ? "admin" : "member" }
})

/** For pages: the user, or a redirect to sign-in. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await currentUser()
  if (!user) redirect("/sign-in")
  return user
}

/** For server actions: the user, or an error the action turns into a message. */
export async function requireActionUser(role?: Role): Promise<CurrentUser> {
  const user = await currentUser()
  if (!user) throw new UserError("You are signed out. Sign in again.")
  if (role === "admin" && user.role !== "admin") throw new UserError("Only an admin can do this.")
  return user
}
