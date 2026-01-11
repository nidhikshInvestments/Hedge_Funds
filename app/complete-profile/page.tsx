"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserCog } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"

export default function CompleteProfilePage() {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUserId(user.id)

      // Check if profile is already complete
      const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

      // Check if profile is complete: all three fields must be present
      if (userData?.profile_completed && userData?.full_name && userData?.phone) {
        // Profile already complete, redirect based on role
        if (userData.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/investor")
        }
      } else {
        // Pre-fill existing data
        setFullName(userData?.full_name || user.user_metadata?.full_name || "")
        setPhone(userData?.phone || "")
      }
    }

    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      if (!userId) throw new Error("User not found")

      // Update user profile
      const { error: updateError } = await supabase
        .from("users")
        .update({
          full_name: fullName,
          phone: phone,
          profile_completed: true,
        })
        .eq("id", userId)

      if (updateError) throw updateError

      // Get user role to redirect appropriately
      const { data: userData } = await supabase.from("users").select("role").eq("id", userId).single()

      if (userData?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/investor")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-yellow-500/10 blur-3xl animation-delay-2000" />
      </div>

      <nav className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl ring-2 ring-amber-500/50">
              <Image src="/images/nidhiksh-logo.jpg" alt="Nidhiksh Investments Logo" fill className="object-contain" />
            </div>
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              Nidhiksh Investments
            </span>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card className="border border-white/10 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 ring-1 ring-white/10">
                <UserCog className="h-8 w-8 text-amber-400" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight text-white">Complete Your Profile</CardTitle>
              <CardDescription className="text-base text-slate-400">
                Please provide a few more details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-slate-300">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-slate-300">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
                    />
                  </div>
                  {error && (
                    <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="h-12 w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-base font-semibold text-white hover:from-amber-600 hover:to-yellow-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Complete Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
