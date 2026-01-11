"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2, Download } from "lucide-react"
import { processBulkUpload, type UniversalRow } from "@/lib/actions/admin-bulk-actions"
import { useRouter } from "next/navigation"

export function BulkImportModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<UniversalRow[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [results, setResults] = useState<any>(null)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            parseCSV(selectedFile)
        }
    }

    const downloadTemplate = () => {
        const headers = ["Action,Email,Date,Amount,Type,Description,FullName,Phone"]
        const examples = [
            "CREATE,new.user@example.com,2024-01-01,100000,DEPOSIT,Initial Seed,New User Name,555-0199",
            "UPDATE,existing@example.com,,,,-,,New Phone Number",
            "TRANSACTION,existing@example.com,2024-02-15,50000,DEPOSIT,Q1 Top Up,,",
            "VALUATION,existing@example.com,2024-02-29,155000,,Feb Valuation,,",
            "TRANSACTION,existing@example.com,2024-03-01,-10000,WITHDRAWAL,Emergency,,",
        ]
        const csvContent = headers.concat(examples).join("\n")
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "investor_import_template.csv"
        a.click()
    }

    const parseCSV = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result as string
            if (!text) return

            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '')
            if (lines.length < 2) return

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
            const data: UniversalRow[] = []

            for (let i = 1; i < lines.length; i++) {
                // Handle potential commas in quoted strings? For now simplicity: standard split
                // Real production apps should use a library like PapaParse
                const values = lines[i].split(',').map(v => v.trim())
                if (values.length < 2) continue // Need at least Action and Email

                const row: any = {}
                headers.forEach((h, idx) => {
                    const val = values[idx]
                    if (!val) return

                    if (h === 'action') row.action = val.toUpperCase()
                    else if (h === 'email') row.email = val
                    else if (h === 'date') row.date = val
                    else if (h === 'amount') row.amount = parseFloat(val)
                    else if (h === 'type') row.type = val
                    else if (h === 'description') row.description = val
                    else if (h === 'fullname') row.fullName = val
                    else if (h === 'phone') row.phone = val
                })

                if (row.action && row.email) {
                    data.push(row as UniversalRow)
                }
            }
            setParsedData(data)
        }
        reader.readAsText(file)
    }

    const handleImport = async () => {
        if (parsedData.length === 0) return
        setIsProcessing(true)
        try {
            const res = await processBulkUpload(parsedData)
            if (res.success) {
                setResults(res.outcomes)
                router.refresh()
            } else {
                alert("Import failed: " + res.error)
            }
        } catch (e) {
            console.error(e)
            alert("Import failed with unknown error")
        } finally {
            setIsProcessing(false)
        }
    }

    const reset = () => {
        setFile(null)
        setParsedData([])
        setResults(null)
        setIsOpen(false)
    }

    const stats = parsedData.reduce((acc: Record<string, number>, row: UniversalRow) => {
        if (row.action) {
            acc[row.action] = (acc[row.action] || 0) + 1
        }
        return acc
    }, {} as Record<string, number>)

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    variant="outline"
                    className="h-12 gap-2 border-white/20 bg-slate-900/50 backdrop-blur-xl font-semibold text-white hover:bg-slate-800/50"
                    onClick={() => setIsOpen(true)}
                >
                    <Upload className="h-5 w-5" />
                    Bulk Import
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>Universal Bulk Import</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Create users, update profiles, add transactions, and record valuations
                        all from one file.
                    </DialogDescription>
                </DialogHeader>

                {!results ? (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={downloadTemplate} className="text-amber-400 hover:text-amber-300">
                                <Download className="mr-2 h-4 w-4" />
                                Download Template
                            </Button>
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="csv">CSV File</Label>
                            <Input id="csv" type="file" accept=".csv" onChange={handleFileChange} className="bg-slate-900 border-slate-700" />
                        </div>

                        {parsedData.length > 0 && (
                            <div className="rounded-md bg-slate-900 p-4">
                                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-sm font-medium">Ready to process {parsedData.length} rows</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-2">
                                    {Object.entries(stats).map(([action, count]) => (
                                        <div key={action} className="bg-slate-800 px-2 py-1 rounded">
                                            {action}: <span className="text-white font-bold">{count}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-xs text-slate-500 max-h-32 overflow-y-auto border-t border-slate-800 pt-2">
                                    {parsedData.slice(0, 5).map((d, i) => (
                                        <div key={i} className="truncate border-b border-slate-800 py-1">
                                            <span className={`font-bold mr-2 ${d.action === 'CREATE' ? 'text-green-400' :
                                                d.action === 'TRANSACTION' ? 'text-blue-400' :
                                                    d.action === 'VALUATION' ? 'text-amber-400' : 'text-slate-400'
                                                }`}>{d.action}</span>
                                            {d.email}
                                        </div>
                                    ))}
                                    {parsedData.length > 5 && <div>...and {parsedData.length - 5} more</div>}
                                </div>
                            </div>
                        )}

                        <Button onClick={handleImport} disabled={!parsedData.length || isProcessing} className="w-full bg-emerald-600 hover:bg-emerald-700">
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            {isProcessing ? "Processing..." : "Run Import"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-md bg-slate-900 p-4 text-center">
                            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                            <h3 className="text-lg font-bold text-white">Import Complete</h3>
                            <p className="text-slate-400 text-sm">Processed {parsedData.length} records</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-emerald-500/10 p-2 rounded border border-emerald-500/20 text-emerald-400 text-center">
                                <span className="block text-xl font-bold">{results.success}</span>
                                Success
                            </div>
                            <div className="bg-red-500/10 p-2 rounded border border-red-500/20 text-red-400 text-center">
                                <span className="block text-xl font-bold">{results.failed}</span>
                                Failed
                            </div>
                        </div>

                        {results.errors.length > 0 && (
                            <div className="text-xs text-red-400 bg-red-950/30 p-2 rounded max-h-32 overflow-y-auto">
                                <p className="font-semibold mb-1">Errors:</p>
                                {results.errors.map((e: string, i: number) => (
                                    <div key={i}>{e}</div>
                                ))}
                            </div>
                        )}

                        <Button onClick={reset} className="w-full" variant="secondary">
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
