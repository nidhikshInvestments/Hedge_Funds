"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { DashboardFooter } from "@/components/dashboard-footer"

export default function AddInvestorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    initialInvestment: "",
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Use Server Action for secure creation
      const { createInvestorAccount } = await import("@/lib/actions/auth-actions")

      const result = await createInvestorAccount(formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to create investor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-600/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-yellow-500/30 to-amber-600/30 blur-3xl animation-delay-2000" />
      </div>

      <nav className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="container mx-auto py-24 space-y-20 flex h-20 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden">
              <Image
                src="/images/nidhiksh-logo.jpg"
                alt="Nidhiksh Investments Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              Nidhiksh Investments
            </span>
          </div>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:bg-white/10 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto max-w-3xl py-10">
        <Card className="border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-bold text-white">
              <UserPlus className="h-8 w-8 text-amber-400" />
              Add New Investor
            </CardTitle>
            <CardDescription className="text-base text-slate-400">
              Create a new investor account with portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-6 text-center">
                <p className="text-lg font-semibold text-green-400">Investor created successfully!</p>
                <p className="mt-2 text-sm text-slate-400">Redirecting to admin dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-slate-200">
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="border-zinc-700 bg-zinc-900/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-200">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="border-zinc-700 bg-zinc-900/50 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-200">
                        Phone *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="border-zinc-700 bg-zinc-900/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-200">
                        Temporary Password *
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="border-zinc-700 bg-zinc-900/50 text-white"
                        placeholder="Min 6 characters"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="initialInvestment" className="text-slate-200">
                        Initial Investment *
                      </Label>
                      <Input
                        id="initialInvestment"
                        type="number"
                        step="0.01"
                        required
                        value={formData.initialInvestment}
                        onChange={(e) => setFormData({ ...formData, initialInvestment: e.target.value })}
                        className="border-zinc-700 bg-zinc-900/50 text-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-slate-200">
                        Investment Start Date *
                      </Label>
                      <Input
                        type="date"
                        id="startDate"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="border-zinc-700 bg-zinc-900/50 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-200">
                      Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="min-h-[100px] border-zinc-700 bg-zinc-900/50 text-white"
                      placeholder="Additional information about the investor..."
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 py-6 text-lg font-semibold text-white hover:from-amber-600 hover:to-yellow-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating Investor...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Create Investor Account
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <DashboardFooter />
    </div>
  )
}
