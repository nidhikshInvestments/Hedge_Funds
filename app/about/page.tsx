import { NavigationWrapper } from "@/components/navigation-wrapper"
import { Footer } from "@/components/footer"
import { Handshake, TreePine, Eye, Gem } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-amber-600/10 blur-3xl animation-delay-2000" />
      </div>

      <div className="relative z-10">
        <NavigationWrapper />

        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="container relative z-10 mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
                About{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Nidhiksh Investments
                </span>
              </h1>
              <p className="text-2xl text-muted-foreground text-pretty">
                Founded on principles of mutual growth, shared success, and unwavering integrity.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 space-y-6 text-xl leading-relaxed shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <p className="text-muted-foreground">
                  Nidhiksh Investments Inc. is a <strong className="text-primary">diversified investment holding company</strong> that operates through a portfolio of wholly owned subsidiaries spanning public market securities and private market investments. Our organizational structure is purpose-built to enable <strong className="text-primary">disciplined capital deployment</strong>, rigorous cross-asset risk management, and the consistent generation of <strong className="text-primary">superior risk-adjusted returns</strong> across market cycles.
                </p>
                <p className="text-muted-foreground">
                  Our operating model reflects a deliberate and proven architecture. A single parent entity provides <strong className="text-primary">centralized governance, unified strategic oversight, and institutional accountability</strong> — while capital is deployed through multiple specialized subsidiary investment vehicles, each purpose-built for its respective mandate and market.
                </p>
                <p className="text-muted-foreground">
                  This structure delivers the best of both worlds: the precision and agility of focused investment strategies, combined with the <strong className="text-primary">resilience, scale, and operational discipline</strong> of a unified holding company platform. Every element of this architecture serves a single, defining objective — the creation, growth, and long-term <strong className="text-primary">preservation of institutional-scale wealth</strong> for our investors and their families.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Core Values</h2>
              <p className="text-xl text-muted-foreground">The principles that guide everything we do.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                    <Handshake className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Trust as Cornerstone</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Every partnership built on consistent action and unwavering integrity. Investor confidence is earned, not assumed.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-accent/20 hover:border-accent/50 transition-all hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
                    <TreePine className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Long-Term Growth</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Sustainable partnerships over short-term gains. We create a legacy of shared financial success across generations.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                    <Eye className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Full Accountability</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Investor interests remain at the forefront of every strategic decision. We take full ownership of our strategies.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-accent/20 hover:border-accent/50 transition-all hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
                    <Gem className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Integrity First</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Guided by ethics and honesty, we uphold the highest standards of professional conduct in everything we do.
                  </p>
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
