"use client"

import { Trash2 } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { deleteSale } from "../actions"

/** Deleting asks first and says what will be lost. Only admins may delete (checked on the server). */
export function DeleteSaleButton({ id, label }: { id: string; label: string }) {
  const [pending, start] = useTransition()
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Delete ${label}`} disabled={pending}>
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this sale?</AlertDialogTitle>
          <AlertDialogDescription>
            {label} will be removed for good. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() =>
              start(async () => {
                const result = await deleteSale(id)
                if (result.ok) toast.success("Sale deleted")
                else toast.error(result.error)
              })
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
