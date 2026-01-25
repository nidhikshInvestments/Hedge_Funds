"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function PeriodSelector({ currentPeriod }: { currentPeriod: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("period", value)
    router.push(`/investor?${params.toString()}`)
  }

  return (
    <select
      value={currentPeriod}
      onChange={(e) => handleChange(e.target.value)}
      className="text-sm px-3 py-1.5 rounded-md border border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
    >
      <option value="ytd">YTD</option>
      <option value="monthly">Monthly</option>
      <option value="yearly">Yearly</option>
      <option value="all">All Time</option>
    </select>
  )
}
