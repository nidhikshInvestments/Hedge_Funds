"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()

      // Just check if we have a valid session for password reset
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      console.log("[v0] Reset password session check:", { session: !!session, error: sessionError })

      if (session) {
        setIsValidSession(true)
      } else {
        setError("Invalid or expired reset link. Please request a new password reset.")
      }

      setIsCheckingSession(false)
    }
    checkSession()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })
      if (updateError) throw updateError

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.email) {
        await fetch("/api/send-password-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        })
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-600/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-yellow-500/30 to-amber-600/30 blur-3xl animation-delay-2000" />
      </div>

      <nav className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden">
              <Image
                src="/images/nidhiksh-logo.jpg"
                alt="Nidhiksh Investments Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              Nidhiksh Investments
            </span>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card className="border border-white/10 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-white/10">
                {isCheckingSession ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : success ? (
                  <Check className="h-8 w-8 text-green-500" />
                ) : (
                  <Lock className="h-8 w-8 text-primary" />
                )}
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight text-white">
                {isCheckingSession ? "Verifying..." : success ? "Password Updated" : "Set New Password"}
              </CardTitle>
              <CardDescription className="text-base text-slate-400">
                {isCheckingSession
                  ? "Verifying your reset link..."
                  : success
                    ? "Your password has been successfully reset. Redirecting to login page in a few seconds."
                    : "Enter your new password below"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCheckingSession ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : success ? (
                <div className="space-y-6">
                  <div className="rounded-xl border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-400">
                    Password successfully reset! You will be redirected to the login page in a few seconds.
                  </div>
                  <Link href="/login">
                    <Button className="h-12 w-full bg-gradient-to-r from-primary to-accent text-base font-semibold text-white hover:opacity-90">
                      Go to Login
                    </Button>
                  </Link>
                </div>
              ) : !isValidSession ? (
                <div className="space-y-6">
                  <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                  </div>
                  <Link href="/forgot-password">
                    <Button className="h-12 w-full bg-gradient-to-r from-primary to-accent text-base font-semibold text-white hover:opacity-90">
                      Request New Reset Link
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="text-slate-300">
                        New Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="At least 6 characters"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword" className="text-slate-300">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                      className="h-12 w-full bg-gradient-to-r from-primary to-accent text-base font-semibold text-white hover:opacity-90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
