import { toNextJsHandler } from "better-auth/next-js"
import { auth } from "@/server/auth"

/** Better Auth's endpoints (sign in, sign up, sign out, session). */
export const GET = (request: Request) => toNextJsHandler(auth()).GET(request)
export const POST = (request: Request) => toNextJsHandler(auth()).POST(request)
