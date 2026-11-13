import { salesEntity } from "@/modules/sales/entity"

/** Every module the scripts can work on, by key. Add new modules here too. */
const modules = { sales: salesEntity }

export type ModuleKey = keyof typeof modules
export type AnyModule = (typeof modules)[ModuleKey]

export function moduleByKey(key: string | undefined): AnyModule | undefined {
  return key && key in modules ? modules[key as ModuleKey] : undefined
}

export const moduleKeys = Object.keys(modules)
