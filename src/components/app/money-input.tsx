"use client"

import { type ComponentProps, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { app } from "@/config/app"
import { centsToInput, parseMoney } from "@/lib/money"

/**
 * A money field: the person types "12,50" or "1.234,50 €", the form receives cents (1250).
 * Use it for every amount; never let a float reach the database.
 */
type Props = Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: number | undefined
  onChange: (cents: number | undefined) => void
}

export function MoneyInput({ value, onChange, onBlur, ...props }: Props) {
  const [text, setText] = useState(centsToInput(value))
  // Follow outside changes (form reset) without fighting the person's typing.
  // biome-ignore lint/correctness/useExhaustiveDependencies: react to the value from outside only, not to typing
  useEffect(() => {
    if (parseMoney(text) !== (value ?? null)) setText(centsToInput(value))
  }, [value])
  return (
    <div className="relative">
      <Input
        {...props}
        inputMode="decimal"
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          onChange(parseMoney(e.target.value) ?? undefined)
        }}
        onBlur={(e) => {
          if (value !== undefined) setText(centsToInput(value))
          onBlur?.(e)
        }}
        className="pr-12"
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
        {app.currency}
      </span>
    </div>
  )
}
