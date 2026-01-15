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
import { Plus, TrendingUp, ArrowRightLeft } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

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

  // Auto-select first portfolio
  useEffect(() => {
    if (portfolios && portfolios.length > 0 && !selectedPortfolio) {
      setSelectedPortfolio(portfolios[0].id)
    }
  }, [portfolios, selectedPortfolio])

  // Add Transaction State
  const [txType, setTxType] = useState<string>("deposit")
  const [txAmount, setTxAmount] = useState("")
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0])
  const [txDescription, setTxDescription] = useState("")
  const [txUpdateValue, setTxUpdateValue] = useState(false)
  const [txNewValue, setTxNewValue] = useState("")
  const [isLoadingTx, setIsLoadingTx] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)
  const [txSuccess, setTxSuccess] = useState(false)

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingTx(true)
    setTxError(null)
    setTxSuccess(false)

    if (!selectedPortfolio || !txAmount || !txDate || !txType) {
      setTxError("Please fill in all required fields")
      setIsLoadingTx(false)
      return
    }

    const numericAmount = Number.parseFloat(txAmount)
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setTxError("Please enter a valid positive amount")
      setIsLoadingTx(false)
      return
    }

    // Smart Value Update Validation
    let numericNewValue = 0
    if (txUpdateValue && txType === 'withdrawal') {
      if (txNewValue === "") {
        setTxError("Please enter the new Portfolio Value")
        setIsLoadingTx(false)
        return
      }
      numericNewValue = Number.parseFloat(txNewValue)
      if (Number.isNaN(numericNewValue) || numericNewValue < 0) {
        setTxError("Please enter a valid new Portfolio Value")
        setIsLoadingTx(false)
        return
      }
    }

    try {
      const supabase = createClient()

      // 1. Insert Cash Flow
      let finalAmount = numericAmount
      if (txType === 'withdrawal' || txType === 'fee' || txType === 'tax') {
        finalAmount = -Math.abs(numericAmount)
      } else {
        finalAmount = Math.abs(numericAmount)
      }

      // DB Constraint Workaround: Map 'capital_gain' to 'other'
      let finalType = txType
      let finalNotes = txDescription || ""

      if (txType === 'capital_gain') {
        finalType = 'other'
        finalNotes = finalNotes ? `(Capital Gain) ${finalNotes}` : "(Capital Gain)"
      }

      const { error: txErr } = await supabase.from("cash_flows").insert({
        portfolio_id: selectedPortfolio,
        date: txDate,
        amount: finalAmount,
        type: finalType,
        notes: finalNotes || undefined
      })

      if (txErr) throw txErr

      // AUTO-UPDATE VALUATION for Capital Gains (Client Side)
      if (txType === 'capital_gain' || (txType === 'other' && finalNotes.includes('Capital Gain'))) {
        try {
          const { data: latestVals } = await supabase
            .from("portfolio_values")
            .select("*")
            .eq("portfolio_id", selectedPortfolio)
            .order("date", { ascending: false })
            .limit(1)

          let baseValue = 0
          if (latestVals && latestVals.length > 0) {
            baseValue = Number(latestVals[0].value)
          }

          const newValue = baseValue + Math.abs(finalAmount)

          await supabase.from("portfolio_values").insert({
            portfolio_id: selectedPortfolio,
            date: txDate,
            value: newValue,
            notes: `Auto-update from Capital Gain (${finalAmount})`
          })
        } catch (err) {
          console.error("Failed to auto-update valuation:", err)
        }
      }

      // 2. Optional: Smart Update Portfolio Value
      if (txUpdateValue && txType === 'withdrawal') {
        const { error: valErr } = await supabase.from("portfolio_values").insert({
          portfolio_id: selectedPortfolio,
          date: txDate,
          value: numericNewValue
        })
        if (valErr) throw valErr
      }

      setTxSuccess(true)
      setTxAmount("")
      setTxDescription("")
      setTxNewValue("")
      setTxUpdateValue(false)

      router.refresh()
      setTimeout(() => setTxSuccess(false), 3000)

    } catch (err: any) {
      console.error(err)
      setTxError(err.message || "An error occurred")
    } finally {
      setIsLoadingTx(false)
    }
  }

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
    <Tabs defaultValue="add-transaction" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-slate-950/50">
        <TabsTrigger
          value="add-transaction"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white"
        >
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Add Transaction
        </TabsTrigger>
        <TabsTrigger
          value="add-value"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Add Valuation
        </TabsTrigger>
        <TabsTrigger
          value="create-portfolio"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Portfolio
        </TabsTrigger>
      </TabsList>

      <TabsContent value="add-transaction" className="mt-6">
        <form onSubmit={handleAddTransaction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tx-portfolio" className="text-slate-300">Select Portfolio</Label>
            <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
              <SelectTrigger id="tx-portfolio" className="border-white/10 bg-slate-950/50 text-white">
                <SelectValue placeholder="Choose a portfolio" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-900">
                {portfolios.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-white">{p.portfolio_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="txType" className="text-slate-300">Type</Label>
              <Select value={txType} onValueChange={setTxType}>
                <SelectTrigger id="txType" className="border-white/10 bg-slate-950/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
                  <SelectItem value="deposit" className="text-white">Deposit</SelectItem>
                  <SelectItem value="withdrawal" className="text-white">Withdrawal</SelectItem>
                  <SelectItem value="fee" className="text-white">Fee</SelectItem>
                  <SelectItem value="capital_gain" className="text-white">Capital Gain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="txAmount" className="text-slate-300">Amount ($)</Label>
              <Input
                id="txAmount"
                type="number"
                step="0.01"
                min="0"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                className="border-white/10 bg-slate-950/50 text-white"
                placeholder="e.g. 50000"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="txDate" className="text-slate-300">Date</Label>
            <Input
              id="txDate"
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              className="border-white/10 bg-slate-950/50 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="txDescription" className="text-slate-300">Description (Optional)</Label>
            <Input
              id="txDescription"
              type="text"
              value={txDescription}
              onChange={(e) => setTxDescription(e.target.value)}
              className="border-white/10 bg-slate-950/50 text-white"
              placeholder="e.g. Monthly withdrawal"
            />
          </div>

          {/* SMART UPDATE LOGIC */}
          {txType === 'withdrawal' && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="smartUpdate"
                  checked={txUpdateValue}
                  onCheckedChange={(c) => setTxUpdateValue(c as boolean)}
                  className="mt-1 border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:text-black"
                />
                <div className="space-y-1">
                  <Label htmlFor="smartUpdate" className="text-amber-200 font-medium cursor-pointer">
                    Update Portfolio Value as well?
                  </Label>
                  <p className="text-xs text-amber-200/70">
                    Since you are withdrawing, the total portfolio value likely changed. Check this to update it instantly.
                  </p>
                </div>
              </div>

              {txUpdateValue && (
                <div className="pl-7 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="txNewValue" className="text-amber-200">New Portfolio Value ($)</Label>
                  <Input
                    id="txNewValue"
                    type="number"
                    step="0.01"
                    min="0"
                    value={txNewValue}
                    onChange={(e) => setTxNewValue(e.target.value)}
                    className="mt-1 border-amber-500/30 bg-black/40 text-white placeholder:text-white/30"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          )}

          {txError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {txError}
            </div>
          )}

          {txSuccess && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
              Transaction recorded successfully!
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 font-semibold text-white hover:from-amber-600 hover:to-yellow-700"
            disabled={isLoadingTx}
          >
            {isLoadingTx ? "Processing..." : "Add Transaction"}
          </Button>
        </form>
      </TabsContent>

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
