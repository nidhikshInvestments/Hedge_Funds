"use client"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdminPeriodSelectorProps {
  portfolioId: string
  currentPeriod: string
}

export function AdminPeriodSelector({ portfolioId, currentPeriod }: AdminPeriodSelectorProps) {
  const router = useRouter()

  const handleValueChange = (value: string) => {
    router.push(`/admin/portfolio/${portfolioId}?period=${value}`)
  }

  return (
    <Select value={currentPeriod} onValueChange={handleValueChange}>
      <SelectTrigger className="h-7 w-[110px] text-xs bg-slate-800/50 border-white/10 text-slate-300 focus:ring-0">
        <SelectValue placeholder="Period" />
      </SelectTrigger>
      <SelectContent className="bg-slate-900 border-white/10">
        <SelectItem value="ALL" className="text-slate-300 focus:bg-slate-800 focus:text-white text-xs">
          All Time
        </SelectItem>
        <SelectItem value="YTD" className="text-slate-300 focus:bg-slate-800 focus:text-white text-xs">
          YTD
        </SelectItem>
        <SelectItem value="yearly" className="text-slate-300 focus:bg-slate-800 focus:text-white text-xs">
          1 Year
        </SelectItem>
        <SelectItem value="monthly" className="text-slate-300 focus:bg-slate-800 focus:text-white text-xs">
          Month
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
