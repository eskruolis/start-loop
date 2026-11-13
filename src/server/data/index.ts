import type { z } from "zod"
import { type DataSourceKind, dataSourceFor } from "../env"
import { memoryRepository } from "./adapters/memory"
import { postgresRepository } from "./adapters/postgres"
import { sheetsRepository } from "./adapters/sheets"
import type { EntityDef, InputOf, RecordOf, Repository } from "./types"

export type { EntityDef, ListQuery, Page, Repository } from "./types"

/**
 * The repository for an entity, from wherever its data lives (DATA_SOURCE_<KEY>, else
 * DATA_SOURCE). Every read and write in the app goes through this.
 */
export function repo<E extends EntityDef<z.ZodObject, z.ZodObject>>(
  entity: E,
  source: DataSourceKind = dataSourceFor(entity.key)
): Repository<RecordOf<E>, InputOf<E>> {
  switch (source) {
    case "postgres":
      return postgresRepository(entity)
    case "sheets":
      return sheetsRepository(entity)
    case "memory":
      return memoryRepository(entity)
  }
}
