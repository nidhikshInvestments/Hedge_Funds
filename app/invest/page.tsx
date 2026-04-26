import { NavigationWrapper } from "@/components/navigation-wrapper"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, FileText, Banknote, Layers, LineChart } from "lucide-react"
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
                Join our investors nationwide who trust Nidhiksh Investments for superior returns with capital preservation strategy.
              </p>
            </div>
          </div>
        </section>

        {/* Investment Benefits */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="p-8 md:p-16 rounded-3xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">Seamless Onboarding</h2>
                  <p className="text-2xl text-primary/90 font-semibold">— A Disciplined 5-Step Approach —</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center relative z-10 h-full">
                    <div className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] bg-gradient-to-r from-primary to-primary/20 -z-10" />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg shadow-primary/30 border-4 border-background shrink-0">
                      <Users className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col items-center mb-4 h-16 shrink-0">
                      <span className="text-2xl font-bold text-primary mb-1">01</span>
                      <div className="flex-1 flex items-center justify-center">
                        <h3 className="text-xl font-bold text-foreground leading-tight">Discovery & Fit</h3>
                      </div>
                    </div>
                    <div className="w-full p-6 rounded-2xl bg-card/60 backdrop-blur-md border border-primary/20 flex-grow flex items-center text-base text-muted-foreground shadow-sm hover:border-primary/50 transition-colors">
                      Initial consultation to assess investor suitability, financial goals, and strategy alignment.
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center relative z-10 h-full">
                    <div className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] bg-gradient-to-r from-primary to-primary/20 -z-10" />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg shadow-primary/30 border-4 border-background shrink-0">
                      <FileText className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col items-center mb-4 h-16 shrink-0">
                      <span className="text-2xl font-bold text-primary mb-1">02</span>
                      <div className="flex-1 flex items-center justify-center">
                        <h3 className="text-xl font-bold text-foreground leading-tight">Due Diligence</h3>
                      </div>
                    </div>
                    <div className="w-full p-6 rounded-2xl bg-card/60 backdrop-blur-md border border-primary/20 flex-grow flex items-center text-base text-muted-foreground shadow-sm hover:border-primary/50 transition-colors">
                      Review offering documents and execute legal agreements under Reg D, 506(C).
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center relative z-10 h-full">
                    <div className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] bg-gradient-to-r from-primary to-primary/20 -z-10" />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg shadow-primary/30 border-4 border-background shrink-0">
                      <Banknote className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col items-center mb-4 h-16 shrink-0">
                      <span className="text-2xl font-bold text-primary mb-1">03</span>
                      <div className="flex-1 flex items-center justify-center">
                        <h3 className="text-xl font-bold text-foreground leading-tight">Funding</h3>
                      </div>
                    </div>
                    <div className="w-full p-6 rounded-2xl bg-card/60 backdrop-blur-md border border-primary/20 flex-grow flex items-center text-base text-muted-foreground shadow-sm hover:border-primary/50 transition-colors">
                      Complete capital contribution process and gain access to your secure Investor Portal.
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center text-center relative z-10 h-full">
                    <div className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] bg-gradient-to-r from-primary to-primary/20 -z-10" />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg shadow-primary/30 border-4 border-background shrink-0">
                      <Layers className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col items-center mb-4 h-16 shrink-0">
                      <span className="text-2xl font-bold text-primary mb-1">04</span>
                      <div className="flex-1 flex items-center justify-center">
                        <h3 className="text-xl font-bold text-foreground leading-tight">Portfolio Build</h3>
                      </div>
                    </div>
                    <div className="w-full p-6 rounded-2xl bg-card/60 backdrop-blur-md border border-primary/20 flex-grow flex items-center text-base text-muted-foreground shadow-sm hover:border-primary/50 transition-colors">
                      Strategic capital deployment with rigorous risk controls and asset allocation.
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex flex-col items-center text-center relative z-10 h-full">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg shadow-primary/30 border-4 border-background shrink-0">
                      <LineChart className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col items-center mb-4 h-16 shrink-0">
                      <span className="text-2xl font-bold text-primary mb-1">05</span>
                      <div className="flex-1 flex items-center justify-center">
                        <h3 className="text-xl font-bold text-foreground leading-tight">Reporting</h3>
                      </div>
                    </div>
                    <div className="w-full p-6 rounded-2xl bg-card/60 backdrop-blur-md border border-primary/20 flex-grow flex items-center text-base text-muted-foreground shadow-sm hover:border-primary/50 transition-colors">
                      Receive ongoing performance updates, financial reports, and profit distributions.
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
