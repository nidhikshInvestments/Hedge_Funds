import { NavigationWrapper } from "@/components/navigation-wrapper"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function InvestPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-amber-600/10 blur-3xl animation-delay-2000" />
      </div>

      <div className="relative z-10">
        <NavigationWrapper />

        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="container relative mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
                Start Your{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Investment Journey
                </span>
              </h1>
              <p className="text-2xl text-muted-foreground text-pretty mb-8">
                Join our investors nationwide who trust Nidhiksh Investments for superior returns and capital protection.
              </p>
            </div>
          </div>
        </section>

        {/* Investment Benefits */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="p-8 md:p-12 rounded-3xl bg-card/50 backdrop-blur-xl border border-border/50">
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">What You Get</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Principal Protection</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        Your initial investment is safeguarded in a secure environment, providing peace of mind and
                        financial confidence.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Performance-Based Returns</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Earn higher annual profits based on our strategic investment performance and market expertise.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Complete Transparency</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Access your personalized dashboard to track portfolio performance, growth metrics, and detailed
                        analytics in real-time.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Dedicated Support</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Our team is committed to your success with responsive support and clear communication throughout
                        your investment journey.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Nationwide Accessibility</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        We proudly welcome investors from all states across the United States to join our growing
                        community.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <div className="relative p-12 md:p-16 rounded-3xl bg-card/80 backdrop-blur-xl border border-border/50 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  If you're an existing investor, sign in to view your portfolio. For new investment opportunities,
                  please get in touch with our team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                  >
                    <Link href="/login">
                      Investor Login <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
