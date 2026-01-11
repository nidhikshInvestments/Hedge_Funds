"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Trash2, Mail, Users, FileDown } from "lucide-react"
import Link from "next/link"
import { bulkDeleteInvestors } from "@/lib/actions/admin-bulk-actions"
import { useRouter } from "next/navigation"

interface Investor {
    id: string
    full_name: string
    email: string
    created_at: string
    portfolios: any[] // Simplified
    latestValue?: number
}

interface InvestorListProps {
    investors: Investor[]
}

export function InvestorList({ investors }: InvestorListProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const toggleAll = () => {
        if (selectedIds.size === investors.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(investors.map((i) => i.id)))
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to PERMANENTLY DELETE ${selectedIds.size} investors? This cannot be undone.`)) {
            return
        }

        setIsDeleting(true)
        try {
            const result = await bulkDeleteInvestors(Array.from(selectedIds))
            if (result.success) {
                setSelectedIds(new Set())
                router.refresh()
            } else {
                alert("Failed to delete some investors: " + result.error)
            }
        } catch (e) {
            alert("An unexpected error occurred")
            console.error(e)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Action Bar */}
            {selectedIds.size > 0 && (
                <div className="sticky top-4 z-50 flex items-center justify-between rounded-xl border border-white/20 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-white">{selectedIds.size} Selected</span>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? "Deleting..." : "Delete Selected"}
                        </Button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="text-slate-400 hover:text-white">
                        Clear Selection
                    </Button>
                </div>
            )}

            <div className="space-y-4">
                {investors.map((investor) => {
                    const isSelected = selectedIds.has(investor.id)
                    const primaryPortfolio = investor.portfolios?.[0]

                    return (
                        <div
                            key={investor.id}
                            className={`flex flex-col gap-4 rounded-2xl border p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between transition-colors ${isSelected
                                    ? "border-amber-500/50 bg-amber-500/10"
                                    : "border-white/10 bg-slate-950/50 hover:border-white/20"
                                }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => toggleSelect(investor.id)}
                                    className="data-[state=checked]:bg-amber-500 border-slate-600"
                                />
                                <div className="flex-1">
                                    <p className="text-xl font-semibold text-white">{investor.full_name || "Unnamed Investor"}</p>
                                    <p className="text-sm text-slate-400">{investor.email}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Joined{" "}
                                        {new Date(investor.created_at).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 pl-10 sm:pl-0">
                                {investor.latestValue !== undefined && (
                                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-amber-600/10 p-4 text-left sm:text-right">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Current Value</p>
                                        <p className="text-2xl font-bold text-white">
                                            $
                                            {Number(investor.latestValue).toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>
                                    </div>
                                )}
                                <Link
                                    href={`/admin/portfolio/${primaryPortfolio?.id || investor.id}`}
                                    className="w-full sm:w-auto"
                                >
                                    <Button
                                        variant="default"
                                        size="default"
                                        className="w-full gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 font-semibold text-white hover:from-amber-600 hover:to-yellow-700 sm:w-auto"
                                    >
                                        Manage Portfolio
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
