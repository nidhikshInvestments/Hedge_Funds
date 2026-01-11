"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Portfolio {
  id: string
  portfolio_name: string
  investor_id: string
  users: {
    full_name: string | null
    email: string
  } | null
}

interface AddValueFormProps {
  portfolios: Portfolio[]
}

export default function AddValueForm({ portfolios }: AddValueFormProps) {
  const [portfolioId, setPortfolioId] = useState("")
  const [value, setValue] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  console.log("[v0] AddValueForm received portfolios:", portfolios)
  console.log("[v0] Portfolios count:", portfolios.length)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    if (!portfolioId || !value || !date) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    const numericValue = Number.parseFloat(value)
    if (Number.isNaN(numericValue) || numericValue < 0) {
      setError("Please enter a valid positive number")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase.from("portfolio_values").insert({
        portfolio_id: portfolioId,
        value: numericValue,
        date: date,
      })

      if (insertError) throw insertError

      setSuccess(true)
      setValue("")
      setDate(new Date().toISOString().split("T")[0])

      // Refresh the page data
      router.refresh()

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/admin")
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="portfolio">Select Portfolio</Label>
        <Select value={portfolioId} onValueChange={setPortfolioId}>
          <SelectTrigger id="portfolio" className="border-2">
            <SelectValue placeholder="Choose a portfolio" />
          </SelectTrigger>
          <SelectContent>
            {portfolios.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">No portfolios available</div>
            ) : (
              portfolios.map((portfolio) => (
                <SelectItem key={portfolio.id} value={portfolio.id}>
                  {portfolio.portfolio_name} -{" "}
                  {portfolio.users?.full_name || portfolio.users?.email || "Unknown Investor"}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {portfolios.length} portfolio{portfolios.length !== 1 ? "s" : ""} available
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">Portfolio Value ($)</Label>
        <Input
          id="value"
          type="number"
          step="0.01"
          min="0"
          placeholder="100000.00"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:scale-125 [&::-webkit-calendar-picker-indicator]:cursor-pointer cursor-pointer"
          onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
        />
      </div>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {success && (
        <div className="rounded-md bg-accent/10 p-3 text-sm text-accent">
          Portfolio value added successfully! Redirecting...
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Portfolio Value"}
      </Button>
    </form>
  )
}
