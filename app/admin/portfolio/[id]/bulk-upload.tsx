"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, Plus, Trash2, FileSpreadsheet } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


type BulkUploadProps = {
  portfolioId: string
}

type ValuationEntry = {
  id: string
  date: string
  value: string
  notes: string
}

type CashFlowEntry = {
  id: string
  date: string
  type: string
  amount: string
  notes: string
}

export function BulkUpload({ portfolioId }: BulkUploadProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"valuations" | "cashflows">("valuations")
  const [valuationEntries, setValuationEntries] = useState<ValuationEntry[]>([
    { id: "1", date: "", value: "", notes: "" },
  ])
  const [cashFlowEntries, setCashFlowEntries] = useState<CashFlowEntry[]>([
    { id: "1", date: "", type: "deposit", amount: "", notes: "" },
  ])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const addValuationRow = () => {
    setValuationEntries([...valuationEntries, { id: Date.now().toString(), date: "", value: "", notes: "" }])
  }

  const removeValuationRow = (id: string) => {
    setValuationEntries(valuationEntries.filter((entry) => entry.id !== id))
  }

  const updateValuationEntry = (id: string, field: keyof ValuationEntry, value: string) => {
    setValuationEntries(valuationEntries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  const addCashFlowRow = () => {
    setCashFlowEntries([
      ...cashFlowEntries,
      { id: Date.now().toString(), date: "", type: "deposit", amount: "", notes: "" },
    ])
  }

  const removeCashFlowRow = (id: string) => {
    setCashFlowEntries(cashFlowEntries.filter((entry) => entry.id !== id))
  }

  const updateCashFlowEntry = (id: string, field: keyof CashFlowEntry, value: string) => {
    setCashFlowEntries(cashFlowEntries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  const handleBulkSubmit = async () => {
    setUploading(true)
    setMessage(null)

    try {
      if (activeTab === "valuations") {
        const validEntries = valuationEntries.filter((entry) => entry.date && entry.value)
        if (validEntries.length === 0) {
          setMessage({ type: "error", text: "Please add at least one valid valuation entry" })
          setUploading(false)
          return
        }

        const response = await fetch(`/api/admin/bulk-upload-valuations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolioId,
            entries: validEntries.map((e) => ({
              date: e.date,
              value: Number.parseFloat(e.value),
              notes: e.notes || null,
            })),
          }),
        })

        if (!response.ok) throw new Error("Failed to upload valuations")
        setMessage({ type: "success", text: `Successfully added ${validEntries.length} valuations` })
        setValuationEntries([{ id: "1", date: "", value: "", notes: "" }])
      } else {
        const validEntries = cashFlowEntries.filter((entry) => entry.date && entry.amount)
        if (validEntries.length === 0) {
          setMessage({ type: "error", text: "Please add at least one valid cash flow entry" })
          setUploading(false)
          return
        }

        const response = await fetch(`/api/admin/bulk-upload-cashflows`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolioId,
            entries: validEntries.map((e) => {
              let amount = Number.parseFloat(e.amount)
              if (e.type === "withdrawal") amount = -Math.abs(amount)
              else if (e.type === "deposit") amount = Math.abs(amount)
              return {
                date: e.date,
                type: e.type,
                amount,
                notes: e.notes || null,
              }
            }),
          }),
        })

        if (!response.ok) throw new Error("Failed to upload cash flows")
        setMessage({ type: "success", text: `Successfully added ${validEntries.length} cash flows` })
        setCashFlowEntries([{ id: "1", date: "", type: "deposit", amount: "", notes: "" }])
      }

      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Upload failed" })
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (!content) return

      const lines = content.split(/\r\n|\n/).filter((line) => line.trim() !== "")
      // Skip header
      const dataLines = lines.slice(1)

      if (activeTab === "valuations") {
        const newEntries: ValuationEntry[] = dataLines.map((line) => {
          // simple CSV split, assuming no commas in notes for now or handled simply
          // A robust parser would contain complex regex but for this template it's fine
          const [date, value, ...notesParts] = line.split(",")
          const notes = notesParts.join(",").replace(/^"(.*)"$/, "$1") // Handle simple quoted notes
          return {
            id: Date.now().toString() + Math.random(),
            date: date?.trim() || "",
            value: value?.trim() || "",
            notes: notes?.trim() || "",
          }
        })
        setValuationEntries(newEntries)
        setMessage({ type: "success", text: `Imported ${newEntries.length} valuation entries. Review and click Upload.` })
      } else {
        const newEntries: CashFlowEntry[] = dataLines.map((line) => {
          const [date, type, amount, ...notesParts] = line.split(",")
          const notes = notesParts.join(",").replace(/^"(.*)"$/, "$1")
          return {
            id: Date.now().toString() + Math.random(),
            date: date?.trim() || "",
            type: type?.trim() || "deposit",
            amount: amount?.trim() || "",
            notes: notes?.trim() || "",
          }
        })
        setCashFlowEntries(newEntries)
        setMessage({ type: "success", text: `Imported ${newEntries.length} cash flow entries. Review and click Upload.` })
      }
    }
    reader.readAsText(file)
    // Reset input
    event.target.value = ""
  }

  const downloadTemplate = () => {
    if (activeTab === "valuations") {
      const csv = "date,value,notes\n2025-01-01,100000.00,Initial valuation\n2025-02-01,105000.00,Monthly update"
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "valuations_template.csv"
      a.click()
    } else {
      const csv =
        "date,type,amount,notes\n2025-01-01,deposit,50000.00,Initial deposit\n2025-01-15,fee,100.00,Management fee"
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "cashflows_template.csv"
      a.click()
    }
  }

  return (
    <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileSpreadsheet className="h-5 w-5 text-blue-400" />
          Bulk Upload Historical Data
        </CardTitle>
        <CardDescription className="text-slate-400">
          Add multiple past entries for valuations or cash flows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab Switcher */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "valuations" ? "default" : "outline"}
            onClick={() => setActiveTab("valuations")}
            className={activeTab === "valuations" ? "bg-blue-600 hover:bg-blue-700" : "border-zinc-700 text-slate-300"}
          >
            Portfolio Valuations
          </Button>
          <Button
            variant={activeTab === "cashflows" ? "default" : "outline"}
            onClick={() => setActiveTab("cashflows")}
            className={activeTab === "cashflows" ? "bg-blue-600 hover:bg-blue-700" : "border-zinc-700 text-slate-300"}
          >
            Cash Flows
          </Button>
        </div>

        {/* Download Template */}
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="w-full border-zinc-700 text-slate-300 hover:bg-zinc-800 bg-transparent"
        >
          <Download className="mr-2 h-4 w-4" />
          Download CSV Template
        </Button>

        {/* Import CSV */}
        <div className="relative inline-block">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 text-slate-300 hover:bg-zinc-800 bg-transparent"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        </div>

        {/* Message */}
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"} className="border-zinc-700">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Valuations Table */}
        {activeTab === "valuations" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-700 overflow-auto max-h-96">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="border-zinc-700 bg-zinc-900/50">
                    <TableHead className="text-slate-300">Date *</TableHead>
                    <TableHead className="text-slate-300">Value (USD) *</TableHead>
                    <TableHead className="text-slate-300">Notes</TableHead>
                    <TableHead className="text-slate-300 w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {valuationEntries.map((entry) => (
                    <TableRow key={entry.id} className="border-zinc-700">
                      <TableCell>
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) => updateValuationEntry(entry.id, "date", e.target.value)}
                          className="border-zinc-700 bg-zinc-900/50 text-white"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="100000.00"
                          value={entry.value}
                          onChange={(e) => updateValuationEntry(entry.id, "value", e.target.value)}
                          className="border-zinc-700 bg-zinc-900/50 text-white"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          placeholder="Optional notes"
                          value={entry.notes}
                          onChange={(e) => updateValuationEntry(entry.id, "notes", e.target.value)}
                          className="border-zinc-700 bg-zinc-900/50 text-white"
                        />
                      </TableCell>
                      <TableCell>
                        {valuationEntries.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeValuationRow(entry.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button
              variant="outline"
              onClick={addValuationRow}
              className="border-zinc-700 text-slate-300 hover:bg-zinc-800 bg-transparent"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Row
            </Button>
          </div>
        )}

        {/* Cash Flows Table */}
        {activeTab === "cashflows" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-700 overflow-auto max-h-96">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="border-zinc-700 bg-zinc-900/50">
                    <TableHead className="text-slate-300">Date *</TableHead>
                    <TableHead className="text-slate-300">Type *</TableHead>
                    <TableHead className="text-slate-300">Amount (USD) *</TableHead>
                    <TableHead className="text-slate-300">Notes</TableHead>
                    <TableHead className="text-slate-300 w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlowEntries.map((entry) => (
                    <TableRow key={entry.id} className="border-zinc-700">
                      <TableCell>
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) => updateCashFlowEntry(entry.id, "date", e.target.value)}
                          className="border-zinc-700 bg-zinc-900/50 text-white"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.type}
                          onValueChange={(value) => updateCashFlowEntry(entry.id, "type", value)}
                        >
                          <SelectTrigger className="border-zinc-700 bg-zinc-900/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-zinc-700 bg-zinc-900">
                            <SelectItem value="deposit">Deposit</SelectItem>
                            <SelectItem value="withdrawal">Withdrawal</SelectItem>
                            <SelectItem value="fee">Fee</SelectItem>
                            <SelectItem value="tax">Tax</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="capital_gain">Capital Gain</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="10000.00"
                          value={entry.amount}
                          onChange={(e) => updateCashFlowEntry(entry.id, "amount", e.target.value)}
                          className="border-zinc-700 bg-zinc-900/50 text-white"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          placeholder="Optional notes"
                          value={entry.notes}
                          onChange={(e) => updateCashFlowEntry(entry.id, "notes", e.target.value)}
                          className="border-zinc-700 bg-zinc-900/50 text-white"
                        />
                      </TableCell>
                      <TableCell>
                        {cashFlowEntries.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCashFlowRow(entry.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button
              variant="outline"
              onClick={addCashFlowRow}
              className="border-zinc-700 text-slate-300 hover:bg-zinc-800 bg-transparent"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Row
            </Button>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleBulkSubmit}
          disabled={uploading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : `Upload ${activeTab === "valuations" ? "Valuations" : "Cash Flows"}`}
        </Button>
      </CardContent>
    </Card>
  )
}
