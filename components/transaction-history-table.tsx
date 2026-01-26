"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { CashFlow } from "@/lib/portfolio-calculations-v2"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TransactionHistoryTableProps {
    transactions: CashFlow[]
}

export function TransactionHistoryTable({ transactions }: TransactionHistoryTableProps) {
    // Sort by Date Descending (Newest First) so they see updates immediately
    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return (
        <Card className="border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Transaction History</CardTitle>
                <CardDescription className="text-slate-400">
                    All recorded deposits, withdrawals, and internal adjustments.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {sortedTransactions.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No transactions recorded.</p>
                ) : (
                    <div className="rounded-md border border-white/10">
                        <Table>
                            <TableHeader className="bg-slate-950/50">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-slate-400">Date</TableHead>
                                    <TableHead className="text-slate-400">Type</TableHead>
                                    <TableHead className="text-slate-400">Description</TableHead>
                                    <TableHead className="text-right text-slate-400">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedTransactions.map((tx, index) => {
                                    const isNegative = Number(tx.amount) < 0 || tx.type === 'withdrawal' || tx.type === 'fee'
                                    // Capital Gains are technically "positive" for value but internal.
                                    // Just use the raw sign of amount if data is good, or enforce type logic.
                                    // Our CSV import mostly sets strict types.

                                    // Let's use the explicit amount sign for color, but handle visual logic
                                    const amount = Number(tx.amount)
                                    const notesLower = (tx.notes || tx.description || '').toLowerCase()
                                    const isReinvestment = tx.type.toLowerCase() === 'reinvestment' || (['other', 'adjustment'].includes(tx.type.toLowerCase()) && notesLower.includes('(reinvestment)'))
                                    const isRed = !isReinvestment && (amount < 0 || tx.type.toLowerCase() === 'withdrawal' || tx.type.toLowerCase() === 'fee')
                                    const isGreen = !isReinvestment && (amount > 0 && !isRed)

                                    const textColor = isReinvestment ? "text-amber-400" : (isGreen ? "text-emerald-400" : isRed ? "text-red-400" : "text-slate-200")

                                    return (
                                        <TableRow key={index} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="font-medium text-slate-200">
                                                {new Date(tx.date).toLocaleDateString("en-US", { timeZone: "UTC" })}
                                            </TableCell>
                                            <TableCell className="capitalize text-slate-300">
                                                {isReinvestment ? (
                                                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-500 ring-1 ring-inset ring-amber-500/20">
                                                        Reinvestment
                                                    </span>
                                                ) : (
                                                    tx.type.replace('_', ' ')
                                                )}
                                            </TableCell>
                                            <TableCell className="text-slate-400 max-w-[200px] truncate">
                                                {tx.notes || tx.description || "-"}
                                            </TableCell>
                                            <TableCell className={`text-right font-mono font-medium ${textColor}`}>
                                                {amount > 0 && !isRed ? "+" : ""}
                                                {formatCurrency(amount)}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
