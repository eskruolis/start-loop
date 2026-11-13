/**
 * Every Postgres table, in one place, for Drizzle and its migrations.
 * A module's table lives next to the module (src/modules/<name>/table.ts) and is re-exported here.
 */

export * from "../../../modules/sales/table"
export * from "./auth"
