"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogOut } from "lucide-react"

interface PeriodSelectorProps {
  currentPeriod: string
  onPeriodChange: (period: string) => void
}

export function PeriodSelector({ currentPeriod, onPeriodChange }: PeriodSelectorProps) {
  return (
    <Select value={currentPeriod} onValueChange={onPeriodChange}>
      <SelectTrigger className="w-[140px] bg-background/50 border-border">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ytd">YTD</SelectItem>
        <SelectItem value="monthly">Monthly</SelectItem>
        <SelectItem value="yearly">Yearly</SelectItem>
        <SelectItem value="all">All Time</SelectItem>
      </SelectContent>
    </Select>
  )
}

interface LogoutButtonProps {
  onLogout: () => void
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
  return (
    <Button
      onClick={onLogout}
      variant="outline"
      size="sm"
      className="bg-background/50 border-border hover:bg-background/80"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
}
