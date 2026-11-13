"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { type FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

/** Sign in and sign up share one form. After success it returns to ?next= (same site only). */
export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const next = params.get("next")
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/"

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const data = new FormData(e.currentTarget)
    const email = String(data.get("email") ?? "")
    const password = String(data.get("password") ?? "")
    const result =
      mode === "sign-in"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: String(data.get("name") ?? "") })
    setPending(false)
    if (result.error) {
      setError(result.error.message ?? "That did not work. Check the details and try again.")
      return
    }
    router.push(target)
    router.refresh()
  }

  const signUp = mode === "sign-up"
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          <h1 className="text-xl">{signUp ? "Create your account" : "Sign in"}</h1>
        </CardTitle>
        <CardDescription>
          {signUp ? "The first account becomes the admin." : "Welcome back."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="auth-form" onSubmit={submit}>
          <FieldGroup>
            {signUp ? (
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" name="name" autoComplete="name" required />
              </Field>
            ) : null}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={signUp ? "new-password" : "current-password"}
                minLength={10}
                required
              />
              {error ? <FieldError>{error}</FieldError> : null}
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button type="submit" form="auth-form" className="w-full" disabled={pending}>
          {pending ? "One moment…" : signUp ? "Create account" : "Sign in"}
        </Button>
        <p className="text-sm text-muted-foreground">
          {signUp ? "Already have an account? " : "No account yet? "}
          <Link
            className="text-foreground underline underline-offset-4"
            href={signUp ? "/sign-in" : "/sign-up"}
          >
            {signUp ? "Sign in" : "Create one"}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
