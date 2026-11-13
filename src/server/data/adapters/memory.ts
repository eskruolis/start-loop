import type { z } from "zod"
import { applyQuery } from "../query"
import { type EntityDef, type InputOf, parseRecord, type RecordOf, type Repository } from "../types"

/**
 * Keeps records in memory (lost on restart). For tests, demos and sketching a new module
 * before deciding where its data lives.
 */
declare global {
  var __startLoopMemory: Map<string, Map<string, Record<string, unknown>>> | undefined
}

function store(key: string) {
  globalThis.__startLoopMemory ??= new Map()
  let table = globalThis.__startLoopMemory.get(key)
  if (!table) {
    table = new Map()
    globalThis.__startLoopMemory.set(key, table)
  }
  return table
}

/** Empties every in-memory table (tests). */
export function resetMemory() {
  globalThis.__startLoopMemory = new Map()
}

export function memoryRepository<E extends EntityDef<z.ZodObject, z.ZodObject>>(
  entity: E
): Repository<RecordOf<E>, InputOf<E>> {
  const table = () => store(entity.key)
  const parse = (data: unknown) => parseRecord(entity, data)
  return {
    async list(query = {}) {
      const rows = [...table().values()].map(parse)
      return applyQuery(rows, { sort: entity.defaultSort, ...query }, entity.searchable)
    },
    async all() {
      return [...table().values()].map(parse)
    },
    async get(id) {
      const row = table().get(id)
      return row ? parse(row) : null
    },
    async create(input) {
      const record = parse({ ...entity.input.parse(input), id: crypto.randomUUID() })
      table().set(record.id, record)
      return record
    },
    async update(id, patch) {
      const current = table().get(id)
      if (!current) throw new Error(`${entity.label}: ${id} not found`)
      const record = parse({ ...current, ...entity.input.partial().parse(patch), id })
      table().set(id, record)
      return record
    },
    async remove(id) {
      table().delete(id)
    },
  }
}
