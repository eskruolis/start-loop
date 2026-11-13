import { and, asc, desc, eq, getTableColumns, ilike, or, type SQL } from "drizzle-orm"
import type { PgColumn } from "drizzle-orm/pg-core"
import type { z } from "zod"
import { db } from "../../db/client"
import { paging } from "../query"
import { type EntityDef, type InputOf, parseRecord, type RecordOf, type Repository } from "../types"

/**
 * Stores records in the entity's Postgres table (a real server in production, PGlite locally).
 * Search, filters, sorting and paging run in SQL, so lists stay fast with many rows.
 */
export function postgresRepository<E extends EntityDef<z.ZodObject, z.ZodObject>>(
  entity: E
): Repository<RecordOf<E>, InputOf<E>> {
  const table = entity.table
  const columns: Record<string, PgColumn> = getTableColumns(table)
  const column = (field: string) => {
    const col = columns[field]
    if (!col) throw new Error(`${entity.label}: the table has no column for "${field}"`)
    return col
  }
  const idColumn = column("id")

  function where(
    search?: string,
    filters?: Record<string, string | number | boolean>
  ): SQL | undefined {
    const parts: (SQL | undefined)[] = []
    const needle = search?.trim()
    if (needle) parts.push(or(...entity.searchable.map((f) => ilike(column(f), `%${needle}%`))))
    for (const [field, value] of Object.entries(filters ?? {})) parts.push(eq(column(field), value))
    return parts.length ? and(...parts) : undefined
  }

  const parse = (row: unknown) => parseRecord(entity, row)

  return {
    async list(query = {}) {
      const { page, pageSize, offset } = paging(query)
      const sort = query.sort ?? entity.defaultSort
      const order = sort.dir === "desc" ? desc(column(sort.field)) : asc(column(sort.field))
      const filter = where(query.search, query.filters)
      const [rows, total] = await Promise.all([
        db()
          .select()
          .from(table)
          .where(filter)
          .orderBy(order, asc(idColumn))
          .limit(pageSize)
          .offset(offset),
        db().$count(table, filter),
      ])
      return { rows: rows.map(parse), total, page, pageSize }
    },
    async all() {
      const rows = await db().select().from(table)
      return rows.map(parse)
    },
    async get(id) {
      const [row] = await db().select().from(table).where(eq(idColumn, id)).limit(1)
      return row ? parse(row) : null
    },
    async create(input) {
      const values = { ...entity.input.parse(input), id: crypto.randomUUID() }
      const [row] = await db().insert(table).values(values).returning()
      return parse(row)
    },
    async update(id, patch) {
      const values = entity.input.partial().parse(patch)
      const [row] = await db().update(table).set(values).where(eq(idColumn, id)).returning()
      if (!row) throw new Error(`${entity.label}: ${id} not found`)
      return parse(row)
    },
    async remove(id) {
      await db().delete(table).where(eq(idColumn, id))
    },
  }
}
