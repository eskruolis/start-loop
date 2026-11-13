import type { PgTable } from "drizzle-orm/pg-core"
import type { z } from "zod"

/**
 * The contract every data source implements. Pages, actions and scripts only ever talk to a
 * `Repository`, never to Postgres or Google directly, so a module can move from Sheets to Postgres
 * by changing one environment variable.
 */
export type Row = { id: string }
export type SortDir = "asc" | "desc"

export interface ListQuery {
  /** Free text, matched against the entity's `searchable` fields. */
  search?: string
  /** Exact matches, e.g. { status: "paid" }. */
  filters?: Record<string, string | number | boolean>
  sort?: { field: string; dir: SortDir }
  /** 1-based. */
  page?: number
  pageSize?: number
}

export interface Page<T> {
  rows: T[]
  total: number
  page: number
  pageSize: number
}

export interface Repository<T extends Row, I> {
  list(query?: ListQuery): Promise<Page<T>>
  /** Every record, unpaged: for dashboards and exports. Mind the size on big tables. */
  all(): Promise<T[]>
  get(id: string): Promise<T | null>
  create(input: I): Promise<T>
  update(id: string, patch: Partial<I>): Promise<T>
  remove(id: string): Promise<void>
}

/**
 * Everything the app knows about one kind of record. One per module (src/modules/<name>/entity.ts).
 * The same definition drives Postgres (`table`), Google Sheets (`sheet`) and the in-memory store.
 */
export interface EntityDef<S extends z.ZodObject, IS extends z.ZodObject> {
  /** Lowercase, plural: "sales". Also the env suffix: DATA_SOURCE_SALES. */
  key: string
  label: string
  /** A full record, id included. */
  schema: S
  /** What create and update accept (usually `schema.omit({ id: true })`). */
  input: IS
  searchable: readonly (keyof z.output<S> & string)[]
  defaultSort: { field: keyof z.output<S> & string; dir: SortDir }
  /** The Google Sheets tab; its first row holds the field names. */
  sheet: { tab: string }
  /** The Postgres table, with one column per schema field (same names). */
  table: PgTable
}

export type RecordOf<E> = E extends EntityDef<infer S, z.ZodObject> ? z.output<S> & Row : never
export type InputOf<E> = E extends EntityDef<z.ZodObject, infer IS> ? z.output<IS> : never

export function defineEntity<S extends z.ZodObject, IS extends z.ZodObject>(def: EntityDef<S, IS>) {
  return def
}

/**
 * Validates raw data (a database row, a sheet row) into the entity's record type. The one place
 * where the generic record type is asserted: `schema.parse` has just checked it at runtime.
 */
export function parseRecord<E extends EntityDef<z.ZodObject, z.ZodObject>>(
  entity: E,
  data: unknown
): RecordOf<E> {
  return entity.schema.parse(data) as RecordOf<E>
}
