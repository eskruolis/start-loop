"use server"

import { revalidatePath } from "next/cache"
import { type ActionResult, runAction } from "@/lib/result"
import { repo } from "@/server/data"
import { requireActionUser } from "@/server/session"
import { salesEntity } from "./entity"
import { saleInputSchema } from "./schema"

/**
 * Writes for sales. Each action: check the user, validate the input with the same schema the form
 * used (never trust the browser), write through the repository, refresh the pages that show it,
 * and return an ActionResult (never throw).
 */
function refresh() {
  revalidatePath("/sales")
  revalidatePath("/")
}

export async function createSale(input: unknown): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requireActionUser()
    const sale = await repo(salesEntity).create(saleInputSchema.parse(input))
    refresh()
    return { id: sale.id }
  })
}

export async function updateSale(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await requireActionUser()
    await repo(salesEntity).update(id, saleInputSchema.parse(input))
    refresh()
    return { id }
  })
}

export async function deleteSale(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await requireActionUser("admin")
    await repo(salesEntity).remove(id)
    refresh()
    return null
  })
}
