"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, TrendingUp } from "lucide-react"

interface Portfolio {
  id: string
  portfolio_name: string
}

interface ManageInvestorFormProps {
  investorId: string
  portfolios: Portfolio[]
}

export default function ManageInvestorForm({ investorId, portfolios }: ManageInvestorFormProps) {
  const router = useRouter()

  // Add Value State
  const [selectedPortfolio, setSelectedPortfolio] = useState("")
  const [value, setValue] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoadingValue, setIsLoadingValue] = useState(false)
  const [valueError, setValueError] = useState<string | null>(null)
  const [valueSuccess, setValueSuccess] = useState(false)

  // Create Portfolio State
  const [portfolioName, setPortfolioName] = useState("")
  const [initialValue, setInitialValue] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false)
  const [portfolioError, setPortfolioError] = useState<string | null>(null)
  const [portfolioSuccess, setPortfolioSuccess] = useState(false)

  const handleAddValue = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingValue(true)
    setValueError(null)
    setValueSuccess(false)

    if (!selectedPortfolio || !value || !date) {
      setValueError("Please fill in all fields")
      setIsLoadingValue(false)
      return
    }

    const numericValue = Number.parseFloat(value)
    if (Number.isNaN(numericValue) || numericValue < 0) {
      setValueError("Please enter a valid positive number")
      setIsLoadingValue(false)
      return
    }

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase.from("portfolio_values").insert({
        portfolio_id: selectedPortfolio,
        value: numericValue,
        date: date,
      })

      if (insertError) throw insertError

      setValueSuccess(true)
      setValue("")
      setDate(new Date().toISOString().split("T")[0])

      router.refresh()

      setTimeout(() => {
        setValueSuccess(false)
      }, 3000)
    } catch (err: unknown) {
      setValueError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoadingValue(false)
    }
  }

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingPortfolio(true)
    setPortfolioError(null)
    setPortfolioSuccess(false)

    if (!portfolioName || !initialValue || !startDate) {
      setPortfolioError("Please fill in all fields")
      setIsLoadingPortfolio(false)
      return
    }

    const numericValue = Number.parseFloat(initialValue)
    if (Number.isNaN(numericValue) || numericValue < 0) {
      setPortfolioError("Please enter a valid positive initial value")
      setIsLoadingPortfolio(false)
      return
    }

    try {
      const supabase = createClient()

      // Create portfolio
      const { data: newPortfolio, error: portfolioError } = await supabase
        .from("portfolios")
        .insert({
          investor_id: investorId,
          portfolio_name: portfolioName,
        })
        .select()
        .single()

      if (portfolioError) throw portfolioError

      // Add initial value
      const { error: valueError } = await supabase.from("portfolio_values").insert({
        portfolio_id: newPortfolio.id,
        value: numericValue,
        date: startDate,
      })

      if (valueError) throw valueError

      setPortfolioSuccess(true)
      setPortfolioName("")
      setInitialValue("")
      setStartDate(new Date().toISOString().split("T")[0])

      router.refresh()

      setTimeout(() => {
        setPortfolioSuccess(false)
      }, 3000)
    } catch (err: unknown) {
      setPortfolioError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoadingPortfolio(false)
    }
  }

  return (
    <Tabs defaultValue="add-value" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-slate-950/50">
        <TabsTrigger
          value="add-value"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Add Portfolio Value
        </TabsTrigger>
        <TabsTrigger
          value="create-portfolio"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Portfolio
        </TabsTrigger>
      </TabsList>

      <TabsContent value="add-value" className="mt-6">
        <form onSubmit={handleAddValue} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="portfolio" className="text-slate-300">
              Select Portfolio
            </Label>
            <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
              <SelectTrigger id="portfolio" className="border-white/10 bg-slate-950/50 text-white">
                <SelectValue placeholder="Choose a portfolio" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-900">
                {portfolios.length > 0 ? (
                  portfolios.map((portfolio) => (
                    <SelectItem key={portfolio.id} value={portfolio.id} className="text-white">
                      {portfolio.portfolio_name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">No portfolios yet. Create one first.</div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value" className="text-slate-300">
              Portfolio Value ($)
            </Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              min="0"
              placeholder="100000.00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-slate-300">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-white/10 bg-slate-950/50 text-white"
              required
            />
          </div>

          {valueError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {valueError}
            </div>
          )}

          {valueSuccess && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
              Portfolio value added successfully!
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 font-semibold text-white hover:from-amber-600 hover:to-yellow-700"
            disabled={isLoadingValue || portfolios.length === 0}
          >
            {isLoadingValue ? "Adding..." : "Add Portfolio Value"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="create-portfolio" className="mt-6">
        <form onSubmit={handleCreatePortfolio} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="portfolioName" className="text-slate-300">
              Portfolio Name
            </Label>
            <Input
              id="portfolioName"
              type="text"
              placeholder="e.g., Growth Portfolio"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              className="border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialValue" className="text-slate-300">
              Initial Investment ($)
            </Label>
            <Input
              id="initialValue"
              type="number"
              step="0.01"
              min="0"
              placeholder="50000.00"
              value={initialValue}
              onChange={(e) => setInitialValue(e.target.value)}
              className="border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-slate-300">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-white/10 bg-slate-950/50 text-white"
              required
            />
          </div>

          {portfolioError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {portfolioError}
            </div>
          )}

          {portfolioSuccess && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
              Portfolio created successfully!
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 font-semibold text-white hover:from-amber-600 hover:to-yellow-700"
            disabled={isLoadingPortfolio}
          >
            {isLoadingPortfolio ? "Creating..." : "Create Portfolio"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}
