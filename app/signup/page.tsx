"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    // Check if user exists via Server Action (to bypass "fake success")
    const { checkUserExists } = await import("@/lib/actions/auth-actions")
    const exists = await checkUserExists(email)

    if (exists) {
      setError("This email is already registered. Please log in instead.")
      setIsLoading(false)
      return
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/investor`,
          data: {
            full_name: fullName,
          },
        },
      })
      if (signUpError) throw signUpError

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      // Improve "User already exists" error message
      if (error.message?.includes("already registered") || error.status === 422) {
        setError("This email is already registered. Please log in instead.")
      } else {
        setError(error instanceof Error ? error.message : "An error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
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
                <Image
                  src="/images/nidhiksh-logo.jpg"
                  alt="Nidhiksh Investments Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                Nidhiksh Investments
              </span>
            </Link>
          </div>
        </nav>

        <div className="relative z-10 flex flex-1 items-center justify-center p-6">
          <Card className="w-full max-w-md border border-white/10 bg-slate-900/50 backdrop-blur-xl">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 ring-1 ring-white/10">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-white">Check Your Email</h2>
              <p className="text-slate-400">
                We've sent you a confirmation email. Please verify your email address to complete registration.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
                <UserPlus className="h-8 w-8 text-amber-400" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight text-white">Create Account</CardTitle>
              <CardDescription className="text-base text-slate-400">
                Join Nidhiksh Investments and start your journey to financial growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-slate-300">
                      Full Name
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
                    <Label htmlFor="email" className="text-slate-300">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="investor@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-slate-300">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
                      placeholder="Minimum 8 characters"
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
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-amber-400 hover:text-amber-300">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
