"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Info, Loader2, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatCurrency } from "@/lib/utils"
import {
  getCashFlowTag,
  hasAutomaticSign,
  isInitialInvestmentRow,
  normalizeAmount,
  roundToCents,
  shiftsValuations,
  splitNoteTag,
} from "@/lib/cash-flow-rules"
import { deleteCashFlowAction, updateCashFlowAction } from "@/lib/actions/cash-flow-actions"

export interface CashFlowRowData {
  id: string
  date: string
  type: string
  amount: number
  notes: string | null
}

// Dates are stored as calendar days, so format in UTC to avoid showing the
// previous day in US time zones.
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

function formatSigned(value: number) {
  return `${value < 0 ? "-" : "+"}${formatCurrency(Math.abs(value))}`
}

function typeLabel(type: string, notes: string | null) {
  const tag = getCashFlowTag(type, notes)
  if (tag === "capital_gain") return "Capital Gain"
  if (tag === "reinvestment") return "Reinvestment"
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const dialogClass = "border-slate-800 bg-slate-950 text-white sm:max-w-md"
const inputClass = "border-zinc-700 bg-zinc-900/50 text-white"
const cancelClass = "border-zinc-700 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white"
export function CashFlowRowActions({ cashFlow }: { cashFlow: CashFlowRowData }) {
  const router = useRouter()
  const label = typeLabel(cashFlow.type, cashFlow.notes)
  const dateLabel = formatDate(cashFlow.date)
  const movesValuations = shiftsValuations(cashFlow.type, cashFlow.notes)
  const autoSign = hasAutomaticSign(cashFlow.type)
  const linkedToProfile = isInitialInvestmentRow(cashFlow.type, cashFlow.notes)
  const { tag: noteTag, text: initialNoteText } = splitNoteTag(cashFlow.notes)
  const initialAmount = (autoSign ? Math.abs(cashFlow.amount) : cashFlow.amount).toFixed(2)

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false)
  const [amount, setAmount] = useState(initialAmount)
  const [noteText, setNoteText] = useState(initialNoteText)
  const [editError, setEditError] = useState<string | null>(null)
  const [isSaving, startSaving] = useTransition()

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, startDeleting] = useTransition()

  const parsedAmount = Number.parseFloat(amount)
  const amountIsValid = Number.isFinite(parsedAmount) && parsedAmount !== 0
  const delta = amountIsValid
    ? roundToCents(normalizeAmount(cashFlow.type, parsedAmount) - cashFlow.amount)
    : 0

  function openEdit(open: boolean) {
    if (open) {
      // Start from the saved values every time the dialog opens.
      setAmount(initialAmount)
      setNoteText(initialNoteText)
      setEditError(null)
    }
    setEditOpen(open)
  }

  function openDelete(open: boolean) {
    if (open) setDeleteError(null)
    setDeleteOpen(open)
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault()
    if (!amountIsValid) return
    setEditError(null)
    startSaving(async () => {
      const result = await updateCashFlowAction({ cashFlowId: cashFlow.id, amount, notes: noteText })
      if (result.ok) {
        setEditOpen(false)
        router.refresh()
      } else {
        setEditError(result.error)
      }
    })
  }

  function handleDelete() {
    setDeleteError(null)
    startDeleting(async () => {
      const result = await deleteCashFlowAction({ cashFlowId: cashFlow.id })
      if (result.ok) {
        setDeleteOpen(false)
        router.refresh()
      } else {
        setDeleteError(result.error)
      }
    })
  }

  return (
    <div className="inline-flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={`Edit ${label} on ${dateLabel}`}
        onClick={() => openEdit(true)}
        className="text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={`Delete ${label} on ${dateLabel}`}
        onClick={() => openDelete(true)}
        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={(open) => !isSaving && openEdit(open)}>
        <DialogContent className={dialogClass}>
          <form onSubmit={handleSave} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>Edit Cash Flow</DialogTitle>
              <DialogDescription className="text-slate-400">
                {label} on {dateLabel}. To change the date or type, delete this row and add it again.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor={`edit-amount-${cashFlow.id}`} className="text-slate-200">
                Amount (USD) *
              </Label>
              <Input
                id={`edit-amount-${cashFlow.id}`}
                type="number"
                step="0.01"
                inputMode="decimal"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${inputClass} font-mono`}
              />
              <p className="text-xs text-slate-500">
                {autoSign
                  ? "Enter positive amount (sign handled automatically)"
                  : "Use a negative amount to record a loss"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit-notes-${cashFlow.id}`} className="text-slate-200">
                Notes (Optional)
              </Label>
              <div className="flex items-stretch gap-2">
                {noteTag && (
                  <span
                    className="inline-flex shrink-0 items-center rounded-md border border-zinc-700 bg-zinc-800/60 px-2.5 text-xs font-medium text-amber-400"
                    title="This tag decides how the row is counted, so it can't be edited"
                  >
                    {noteTag}
                  </span>
                )}
                <Input
                  id={`edit-notes-${cashFlow.id}`}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Any notes about this cash flow..."
                  disabled={linkedToProfile}
                  className={`${inputClass} disabled:opacity-70`}
                />
              </div>
              {linkedToProfile && (
                <p className="text-xs text-slate-500">
                  Linked to Initial Capital in the Investor Profile. Changing the amount here updates it there too.
                </p>
              )}
            </div>

            {movesValuations && delta !== 0 && (
              <div className="flex gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-slate-300">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <p>
                  The valuation on {dateLabel} and every later valuation will change by{" "}
                  <span className="font-mono font-medium text-white">{formatSigned(delta)}</span>.
                </p>
              </div>
            )}

            {editError && (
              <p role="alert" className="rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-300">
                {editError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => openEdit(false)}
                className={cancelClass}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !amountIsValid}
                className="bg-linear-to-r from-amber-500 to-yellow-600 text-black hover:from-amber-600 hover:to-yellow-700"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={(open) => !isDeleting && openDelete(open)}>
        <AlertDialogContent className={dialogClass}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this cash flow?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-slate-400">
                <p>
                  {label} of <span className="font-mono text-white">{formatSigned(cashFlow.amount)}</span> on{" "}
                  {dateLabel}.
                </p>
                {movesValuations && (
                  <p>
                    The valuation on that date and every later valuation will change by{" "}
                    <span className="font-mono text-white">{formatSigned(-cashFlow.amount)}</span>.
                  </p>
                )}
                <p>This can&apos;t be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <p role="alert" className="rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-300">
              {deleteError}
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className={cancelClass}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
