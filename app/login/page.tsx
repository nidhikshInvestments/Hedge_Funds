"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Lock, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError

      // Get user role to redirect appropriately
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

        if (userData?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/investor")
        }
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })
      if (error) throw error

      // The user will be redirected to Google's OAuth page
      // No need to do anything here, the redirect happens automatically
    } catch (error: unknown) {
      console.log("[v0] Google OAuth error:", error)
      const errorMessage = error instanceof Error ? error.message : "An error occurred"

      if (errorMessage.includes("provider")) {
        setError("Google login is not configured. Please contact support at nidhiksh.investments@gmail.com")
      } else {
        setError(errorMessage)
      }
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

      {/* Navigation */}
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
            {/* </CHANGE> */}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              Nidhiksh Investments
            </span>
          </Link>
        </div>
      </nav>

      {/* Login Form */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card className="border border-white/10 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-white/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight text-white">Investor Login</CardTitle>
              <CardDescription className="text-base text-slate-400">
                Access your investment portfolio and performance analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="outline"
                className="mb-6 h-12 w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={handleGoogleSignIn}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative mb-6">
                <Separator className="bg-white/10" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 text-xs text-slate-400">
                  or continue with email
                </span>
              </div>

              <form onSubmit={handleLogin}>
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
                    />
                  </div>
                  <div className="text-right">
                    <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="text-xs text-slate-500 text-center -mt-3">
                    (Google Sign-In users don't need a password)
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
                    {isLoading ? "Signing in..." : "Sign In to Portal"}
                  </Button>
                </div>
              </form>
              <div className="mt-6 space-y-3 text-center">
                <p className="text-sm text-slate-400">
                  Don't have an account?{" "}
                  <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
                    Sign up
                  </Link>
                </p>
                <p className="text-sm text-slate-400">
                  Need assistance? Contact{" "}
                  <a
                    href="mailto:nidhiksh.investments@gmail.com"
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    nidhiksh.investments@gmail.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-400">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span>Protected with enterprise-grade encryption</span>
          </div>
        </div>
      </div>
    </div>
  )
}
