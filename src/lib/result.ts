import { z } from "zod"

/**
 * What every server action returns. Actions never throw to the browser: in production Next hides
 * a thrown error's message, so the user would only see "something went wrong".
 */
export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

/** An error whose message is safe and useful to show the user. */
export class UserError extends Error {}

/**
 * Runs an action body and turns failures into an ActionResult: validation errors become field
 * errors, a UserError shows its message, anything else is logged and shown as a generic message.
 */
export async function runAction<T>(body: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await body() }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const flat = z.flattenError(error)
      return {
        ok: false,
        error: "Please fix the highlighted fields.",
        fieldErrors: flat.fieldErrors as Record<string, string[]>,
      }
    }
    if (error instanceof UserError) return { ok: false, error: error.message }
    console.error("[action]", error)
    return { ok: false, error: "Something went wrong. Please try again." }
  }
}
