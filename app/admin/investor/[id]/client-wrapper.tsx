"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <Button
      onClick={handleSignOut}
      variant="ghost"
      size="sm"
      className="text-slate-300 hover:bg-white/10 hover:text-white"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}

export function PeriodSelector({ currentPeriod }: { currentPeriod: string }) {
  const router = useRouter()
  const params = useParams()
  const investorId = params.id as string

  const handleChange = (value: string) => {
    router.push(`/admin/investor/${investorId}?period=${value}`)
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
