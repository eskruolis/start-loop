"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type ReactNode, useState } from "react"
import { Controller, type DefaultValues, useForm } from "react-hook-form"
import { toast } from "sonner"
import { MoneyInput } from "@/components/app/money-input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { todayIso } from "@/lib/format"
import { createSale, updateSale } from "../actions"
import {
  SALE_STATUSES,
  type Sale,
  type SaleFormValues,
  type SaleInput,
  saleInputSchema,
} from "../schema"
import { STATUS_LABEL } from "./status"

/**
 * Create or edit a sale in a dialog. The form validates with the same schema as the server action,
 * so the person sees the error under the field before anything is sent; the server checks again.
 */
/** A new sale: today, one item, no amount yet (the person must type it). */
const emptySale = (): DefaultValues<SaleFormValues> => ({
  date: todayIso(),
  customer: "",
  product: "",
  category: "",
  quantity: 1,
  amount: undefined,
  status: "draft",
  notes: "",
})

export function SaleFormDialog({ sale, trigger }: { sale?: Sale; trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const form = useForm<SaleFormValues, unknown, SaleInput>({
    resolver: zodResolver(saleInputSchema),
    defaultValues: sale ?? emptySale(),
  })

  // Every time the dialog opens, start from the record as it is now (never from values left over
  // from an earlier opening or from another record).
  function onOpenChange(next: boolean) {
    if (next) form.reset(sale ?? emptySale())
    setOpen(next)
  }
  const { errors, isSubmitting } = form.formState

  async function onSubmit(values: SaleInput) {
    const result = sale ? await updateSale(sale.id, values) : await createSale(values)
    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        form.setError(field as keyof SaleFormValues, { message: messages[0] })
      }
      toast.error(result.error)
      return
    }
    toast.success(sale ? "Sale updated" : "Sale added")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{sale ? "Edit sale" : "New sale"}</DialogTitle>
          <DialogDescription>Amounts include tax. Required fields are marked *.</DialogDescription>
        </DialogHeader>
        <form id="sale-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.date}>
                <FieldLabel htmlFor="date">Date *</FieldLabel>
                <Input
                  id="date"
                  type="date"
                  aria-invalid={!!errors.date}
                  {...form.register("date")}
                />
                <FieldError errors={[errors.date]} />
              </Field>
              <Field data-invalid={!!errors.status}>
                <FieldLabel htmlFor="status">Status *</FieldLabel>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue>{STATUS_LABEL[field.value]}</SelectValue>
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {SALE_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.status]} />
              </Field>
            </div>
            <Field data-invalid={!!errors.customer}>
              <FieldLabel htmlFor="customer">Customer *</FieldLabel>
              <Input
                id="customer"
                autoComplete="off"
                aria-invalid={!!errors.customer}
                {...form.register("customer")}
              />
              <FieldError errors={[errors.customer]} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.product}>
                <FieldLabel htmlFor="product">Product *</FieldLabel>
                <Input id="product" aria-invalid={!!errors.product} {...form.register("product")} />
                <FieldError errors={[errors.product]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Input id="category" {...form.register("category")} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.quantity}>
                <FieldLabel htmlFor="quantity">Quantity *</FieldLabel>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  {...form.register("quantity", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.quantity]} />
              </Field>
              <Field data-invalid={!!errors.amount}>
                <FieldLabel htmlFor="amount">Total *</FieldLabel>
                <Controller
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <MoneyInput
                      id="amount"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-invalid={!!errors.amount}
                    />
                  )}
                />
                <FieldError
                  errors={[
                    errors.amount?.message
                      ? errors.amount
                      : errors.amount && { message: "Enter an amount" },
                  ]}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea id="notes" rows={3} {...form.register("notes")} />
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="sale-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : sale ? "Save changes" : "Add sale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
