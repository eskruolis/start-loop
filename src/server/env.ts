import { z } from "zod"

/**
 * Every environment variable the app reads, checked once at start (next.config imports this file,
 * so a missing or malformed value stops `next dev` / `next build` with a clear message instead of
 * failing later at runtime). Read env only through `env`, never `process.env` elsewhere.
 * An empty value in .env ("FOO=") counts as not set.
 */
const DATA_SOURCES = ["postgres", "sheets", "memory"] as const
export type DataSourceKind = (typeof DATA_SOURCES)[number]

const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v)
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(blankToUndefined, schema.optional())

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: optional(z.string().regex(/^postgres(ql)?:\/\//, "must start with postgres://")),
  DATA_SOURCE: z.preprocess(blankToUndefined, z.enum(DATA_SOURCES).default("postgres")),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "set a random string of 32+ characters (openssl rand -base64 32)"),
  // Unset on a Vercel preview: the deployment's own address, so sign-in works on every preview.
  BETTER_AUTH_URL: z.preprocess(
    (v) =>
      blankToUndefined(v) ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
    z.url().default("http://localhost:3000")
  ),
  GOOGLE_SHEETS_ID: optional(z.string()),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: optional(z.email()),
  GOOGLE_PRIVATE_KEY: optional(z.string()),
})

export type Env = z.infer<typeof schema>

function load(): Env {
  if (process.env.SKIP_ENV_VALIDATION === "1")
    return schema.parse({ ...process.env, BETTER_AUTH_SECRET: "x".repeat(32) })
  const parsed = schema.safeParse(process.env)
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n")
    throw new Error(`Invalid environment variables (see .env.example):\n${lines}`)
  }
  return parsed.data
}

export const env = load()

/**
 * Where a module keeps its data: `DATA_SOURCE_<KEY>` (e.g. DATA_SOURCE_SALES=sheets) wins over the
 * default `DATA_SOURCE`. This is what makes the app hybrid: each module can live in a different place.
 */
export function dataSourceFor(moduleKey: string): DataSourceKind {
  const own = blankToUndefined(process.env[`DATA_SOURCE_${moduleKey.toUpperCase()}`])
  if (own === undefined) return env.DATA_SOURCE
  const parsed = z.enum(DATA_SOURCES).safeParse(own)
  if (!parsed.success)
    throw new Error(
      `DATA_SOURCE_${moduleKey.toUpperCase()} must be one of ${DATA_SOURCES.join(", ")}`
    )
  return parsed.data
}

/** Google Sheets credentials, or null when they are not configured. */
export function sheetsCredentials() {
  const { GOOGLE_SHEETS_ID: id, GOOGLE_SERVICE_ACCOUNT_EMAIL: email, GOOGLE_PRIVATE_KEY: key } = env
  if (!id || !email || !key) return null
  // Keys pasted into .env keep "\n" as two characters; Google needs real line breaks.
  return { spreadsheetId: id, email, privateKey: key.replace(/\\n/g, "\n") }
}
