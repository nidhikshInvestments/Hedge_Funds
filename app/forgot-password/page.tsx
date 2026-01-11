"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const redirectUrl = "https://v0-hedge-fund-investor-portal.vercel.app/auth/callback?next=/reset-password"

      console.log("[v0] Password reset redirect URL:", redirectUrl)

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      // Check if this is an OAuth-only user
      if (resetError && resetError.message.includes("signups not allowed")) {
        setError(
          "This email is registered with Google Sign-In. Please use the 'Continue with Google' button on the login page, or contact support at nidhiksh.investments@gmail.com to add password login to your account.",
        )
        setIsLoading(false)
        return
      }

      if (resetError) {
        // For security, don't reveal if email exists or not
        console.log("[v0] Password reset error:", resetError)
      }

      // Always show success to prevent email enumeration attacks
      setSuccess(true)
    } catch (error: unknown) {
      console.log("[v0] Forgot password error:", error)
      // For security, show success even on error
      setSuccess(true)
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
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight text-white">Reset Password</CardTitle>
              <CardDescription className="text-base text-slate-400">
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="space-y-6">
                  <div className="rounded-xl border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-400">
                    If an account exists with this email address, a password reset link has been sent. Please check your
                    inbox and spam folder.
                  </div>
                  <div className="rounded-xl border border-blue-500/50 bg-blue-500/10 p-4 text-sm text-blue-400">
                    <strong>Note:</strong> If you signed up with Google, you don't need a password. Use the "Continue
                    with Google" button on the login page.
                  </div>
                  <div className="text-center text-sm text-slate-400">
                    Didn't receive the email?{" "}
                    <button
                      onClick={() => {
                        setSuccess(false)
                        setEmail("")
                      }}
                      className="font-medium text-primary hover:text-primary/80"
                    >
                      Try again
                    </button>
                  </div>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="h-12 w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleResetRequest}>
                  <div className="flex flex-col gap-6">
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
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="h-12 w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                      </Button>
                    </Link>
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
