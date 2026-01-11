"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface NavigationProps {
  isLoggedIn?: boolean
  isAdmin?: boolean
  userName?: string
}

export function Navigation({ isLoggedIn = false, isAdmin = false, userName = "Account" }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/invest", label: "Invest" },
    { href: "/contact", label: "Contact Us" },
  ]

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-accent opacity-50 blur-lg transition-opacity group-hover:opacity-75" />
              <div className="relative h-14 w-14 rounded-lg overflow-hidden">
                <Image
                  src="/images/nidhiksh-logo.jpg"
                  alt="Nidhiksh Investments Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <span className="text-xl font-bold text-white">Nidhiksh Investments</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap text-sm font-medium transition-all hover:text-primary ${pathname === link.href ? "text-primary" : "text-gray-300"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {!isLoggedIn && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <Link href="/login">Investor Login</Link>
              </Button>
            )}

            <div className="flex items-center gap-3 border-l border-white/20 pl-6">
              {isLoggedIn ? (
                <>
                  <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    <Link href={isAdmin ? "/admin" : "/investor"}>
                      <User className="mr-2 h-4 w-4" />
                      {userName}
                    </Link>
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10 bg-transparent"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  <Link href="/signup">Get Started</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="text-white lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 py-4 lg:hidden">
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-gray-300"
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-300 transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Investor Login
                </Link>
              )}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                {isLoggedIn ? (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full border-white/20 text-gray-300 hover:text-white hover:border-white/40 bg-transparent justify-start"
                    >
                      <Link href={isAdmin ? "/admin" : "/investor"} onClick={() => setMobileMenuOpen(false)}>
                        <User className="mr-2 h-4 w-4" />
                        {userName}
                      </Link>
                    </Button>
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleSignOut()
                      }}
                      size="sm"
                      variant="outline"
                      className="w-full border-white/20 text-gray-300 hover:text-white hover:border-white/40 bg-transparent justify-start"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold"
                  >
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
