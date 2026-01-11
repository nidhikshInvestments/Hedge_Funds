"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createBrowserClient } from "@supabase/ssr"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({ name: "", email: "", phoneNumber: "", subject: "", message: "" })
          setSubmitted(false)
        }, 3000)
      } else {
        setError(data.error || "Failed to send message. Please try again.")
      }
    } catch (err) {
      console.error("[v0] Contact form submission error:", err)
      setError("Failed to send message. Please try emailing us directly at nidhiksh.investments@gmail.com")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-amber-600/10 blur-3xl animation-delay-2000" />
      </div>

      <div className="relative z-10">
        <Navigation isLoggedIn={isLoggedIn} />

        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="mb-6 text-balance text-4xl font-bold md:text-6xl">
                Get In{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Touch</span>
              </h1>
              <p className="text-pretty text-2xl text-muted-foreground">
                Have questions? We are here to help you begin your investment journey with Nidhiksh.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-8 shadow-2xl shadow-primary/10 backdrop-blur-xl md:p-12">
                <h2 className="mb-6 text-2xl font-bold text-primary md:text-3xl">Send Us a Message</h2>
                {error && (
                  <div className="mb-6 rounded-2xl border-2 border-red-500/50 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
                {submitted ? (
                  <div className="rounded-2xl border-2 border-green-500/50 bg-green-500/10 p-6 text-center">
                    <p className="text-xl font-semibold text-green-400">Message Sent!</p>
                    <p className="mt-2 text-base text-muted-foreground">We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <Label htmlFor="name" className="text-zinc-200">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="mt-2 border-2 border-zinc-700 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus-visible:border-primary/50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-zinc-200">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="mt-2 border-2 border-zinc-700 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus-visible:border-primary/50"
                        />
                      </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <Label htmlFor="phone" className="text-zinc-200">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          required
                          className="mt-2 border-2 border-zinc-700 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus-visible:border-primary/50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject" className="text-zinc-200">
                          Subject
                        </Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                          className="mt-2 border-2 border-zinc-700 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus-visible:border-primary/50"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-zinc-200">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className="mt-2 min-h-[150px] border-2 border-zinc-700 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus-visible:border-primary/50"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 w-full bg-gradient-to-r from-primary to-accent text-lg font-semibold hover:shadow-lg hover:shadow-primary/30"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                      <Send className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              <a
                href="mailto:nidhiksh.investments@gmail.com"
                className="group relative rounded-2xl border border-border/50 bg-card/50 p-8 text-center backdrop-blur-xl transition-all hover:border-primary/50"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Mail className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">Email Us</h3>
                  <p className="break-all text-lg text-muted-foreground">nidhiksh.investments@gmail.com</p>
                </div>
              </a>

              <a
                href="tel:4695148785"
                className="group relative rounded-2xl border border-border/50 bg-card/50 p-8 text-center backdrop-blur-xl transition-all hover:border-accent/50"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary">
                    <Phone className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">Call or Text</h3>
                  <p className="text-lg text-muted-foreground">469-514-8785</p>
                </div>
              </a>

              <div className="group relative rounded-2xl border border-border/50 bg-card/50 p-8 text-center backdrop-blur-xl transition-all hover:border-primary/50">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                    <MapPin className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">Location</h3>
                  <p className="text-lg text-muted-foreground">
                    Serving All States
                    <br />
                    Across the USA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-3xl border border-border/50 bg-card/50 p-8 text-center backdrop-blur-xl md:p-12">
                <h2 className="mb-4 text-2xl font-bold md:text-3xl">Office Hours</h2>
                <p className="mb-6 text-xl text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM CST</p>
                <p className="text-lg text-muted-foreground">
                  We typically respond to all inquiries within 24 business hours. For urgent matters, please call us
                  directly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
