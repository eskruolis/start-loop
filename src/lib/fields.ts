import { z } from "zod"

/**
 * Field builders for module schemas. Each one is a plain Zod type plus a "kind", which tells the
 * Google Sheets adapter how to read and write the cell (a money cell holds 12.50, the app holds
 * 1250 cents). Build every module field with these, passing limits as options:
 * `fields.number({ int: true, min: 1 })`, not `fields.number().int()` (chaining drops the kind).
 *
 * Inside the app: money is integer cents, dates are "YYYY-MM-DD" strings (a business date, no time
 * zone), text is never null (empty text is "").
 */
export type FieldKind = "id" | "text" | "number" | "money" | "date" | "boolean" | "enum"

export const fieldKinds = z.registry<{ kind: FieldKind }>()

function mark<T extends z.ZodType>(schema: T, kind: FieldKind): T {
  fieldKinds.add(schema, { kind })
  return schema
}

export const fields = {
  id: () => mark(z.string().min(1), "id"),
  /** Optional text; empty means "". */
  text: (opts: { max?: number } = {}) =>
    mark(
      z
        .string()
        .trim()
        .max(opts.max ?? 500)
        .default(""),
      "text"
    ),
  /** Text that must be filled in. */
  requiredText: (opts: { max?: number } = {}) =>
    mark(
      z
        .string()
        .trim()
        .min(1, "Required")
        .max(opts.max ?? 500),
      "text"
    ),
  number: (opts: { int?: boolean; min?: number; max?: number } = {}) => {
    const base = z.number({ error: (i) => (i.input === undefined ? "Required" : "Enter a number") })
    let n = opts.int ? base.int("Use a whole number") : base
    if (opts.min !== undefined) n = n.min(opts.min, `At least ${opts.min}`)
    if (opts.max !== undefined) n = n.max(opts.max, `At most ${opts.max}`)
    return mark(n, "number")
  },
  /** Integer cents: 12.50 € is 1250. Never store money as a float. */
  money: (opts: { min?: number } = {}) => {
    let n = z
      .number({
        error: (i) => (i.input === undefined ? "Enter an amount" : "Enter an amount like 12.50"),
      })
      .int("Money is stored in whole cents")
    if (opts.min !== undefined) n = n.min(opts.min, "Too small")
    return mark(n, "money")
  },
  date: () =>
    mark(
      z.iso.date({ error: (i) => (i.input ? "Use a date like 2026-11-13" : "Required") }),
      "date"
    ),
  boolean: () => mark(z.boolean().default(false), "boolean"),
  enumOf: <const T extends readonly [string, ...string[]]>(values: T) =>
    mark(z.enum(values), "enum"),
}

/** Unwraps .optional() / .nullable() / .default() to the field's own schema. */
function inner(field: z.ZodType): z.ZodType {
  let current: z.ZodType = field
  for (let i = 0; i < 5; i++) {
    if (fieldKinds.has(current)) return current
    const def = current._zod.def as { innerType?: z.ZodType }
    if (!def.innerType) return current
    current = def.innerType
  }
  return current
}

/** Best guess for a field built without `fields.*`: from its Zod type. */
function guess(field: z.ZodType): FieldKind {
  const type = field._zod.def.type
  if (type === "number") return "number"
  if (type === "boolean") return "boolean"
  if (type === "enum") return "enum"
  if (type === "string" && (field as z.ZodString).format === "date") return "date"
  return "text"
}

/** The kind of each field of an object schema, for adapters that store plain text. */
export function kindsOf(schema: z.ZodObject): Record<string, FieldKind> {
  const out: Record<string, FieldKind> = {}
  for (const [key, field] of Object.entries(schema.shape)) {
    const own = inner(field as z.ZodType)
    out[key] = fieldKinds.get(own)?.kind ?? guess(own)
  }
  return out
}
