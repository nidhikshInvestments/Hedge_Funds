"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Check, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleUpdatePassword = async (e: React.FormEvent) => {
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

        setIsLoading(true)

        try {
            // Update password AND clear the force_change flag
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
                data: { force_password_change: null }
            })

            if (updateError) throw updateError

            setSuccess(true)

            // Refresh router to clear any cached auth state/redirects
            router.refresh()

            setTimeout(() => {
                router.push("/investor") // Redirect to dashboard
            }, 2000)

        } catch (error: any) {
            setError(error.message || "An error occurred updating your password")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-black">
                <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-600/10 blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-yellow-500/10 to-amber-600/10 blur-3xl animation-delay-2000" />
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
                                {success ? (
                                    <Check className="h-8 w-8 text-green-500" />
                                ) : (
                                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                                )}
                            </div>
                            <CardTitle className="text-2xl font-bold tracking-tight text-white">
                                {success ? "Password Updated" : "Change Password Required"}
                            </CardTitle>
                            <CardDescription className="text-base text-slate-400">
                                {success
                                    ? "Your password has been updated. Redirecting..."
                                    : "For your security, you must update your temporary password to continue."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {success ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                                </div>
                            ) : (
                                <form onSubmit={handleUpdatePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="At least 6 characters"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="border-white/10 bg-slate-950/50 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Re-enter your password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="border-white/10 bg-slate-950/50 text-white"
                                        />
                                    </div>

                                    {error && (
                                        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:from-amber-600 hover:to-yellow-700"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            "Set New Password & Continue"
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
