"use client"

import { useRouter, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Range = "30D" | "60D" | "90D" | "1Y" | "ALL"

interface RangeSelectorProps {
  currentRange: Range
}

export function RangeSelector({ currentRange }: RangeSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleRangeChange = (value: Range) => {
    router.push(`${pathname}?range=${value}`)
  }

  return (
    <Select value={currentRange} onValueChange={handleRangeChange}>
      <SelectTrigger className="w-[140px] border-amber-500/20 bg-slate-900/50 text-white hover:bg-slate-900/70 focus:ring-amber-500/50">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent className="border-amber-500/20 bg-slate-900 text-white">
        <SelectItem value="30D" className="hover:bg-slate-800 focus:bg-slate-800 focus:text-white">
          Last 30 Days
        </SelectItem>
        <SelectItem value="60D" className="hover:bg-slate-800 focus:bg-slate-800 focus:text-white">
          Last 60 Days
        </SelectItem>
        <SelectItem value="90D" className="hover:bg-slate-800 focus:bg-slate-800 focus:text-white">
          Last 90 Days
        </SelectItem>
        <SelectItem value="1Y" className="hover:bg-slate-800 focus:bg-slate-800 focus:text-white">
          Last Year
        </SelectItem>
        <SelectItem value="ALL" className="hover:bg-slate-800 focus:bg-slate-800 focus:text-white">
          All Time
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
