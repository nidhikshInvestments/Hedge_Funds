import { NavigationWrapper } from "@/components/navigation-wrapper"
import { Footer } from "@/components/footer"
import { TrendingUp, Building2, Lightbulb, CheckCircle2 } from "lucide-react"

export default function SubsidiariesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-amber-600/10 blur-3xl animation-delay-2000" />
      </div>

      <div className="relative z-10">
        <NavigationWrapper />

        {/* Hero Section */}
        <section className="pt-24 pb-8 md:pt-32 md:pb-12">
          <div className="container relative z-10 mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance text-white">
                Our{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Subsidiaries
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground text-pretty">
                A structured and disciplined investment holding strategy across public markets, commercial real estate, and private ventures.
              </p>
            </div>
          </div>
        </section>

        {/* Subsidiaries Cards Section */}
        <section className="py-12 md:py-20 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto">
              
              {/* 1. Nidhiksh Public Market */}
              <div className="group relative p-8 rounded-3xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] flex flex-col h-full justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Public Market</h2>
                  </div>

                  {/* Mandate Statement */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm italic text-amber-200/90 leading-relaxed">
                    "The mandate of Nidhiksh Public Market Company is clear and unwavering: preserve capital, compound consistently, and outperform traditional equity benchmarks through disciplined, controlled risk management."
                  </div>

                  {/* Universe of Leaders Section */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Universe of Leaders</h3>
                    <p className="text-sm text-slate-300">
                      Operating exclusively within a universe of high-quality, mega-cap, and blue-chip leaders demonstrated for durable compounding:
                    </p>
                    <ul className="space-y-2.5 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                        <span>Sustainable competitive advantages (scale, innovation, and leadership).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                        <span>Robust free cash flow generation supporting reinvestment and returns.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                        <span>High returns on invested capital reflecting business quality.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                        <span>Dominant global market share across essential sectors.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                        <span>Resilience and stability across economic cycles and regimes.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Investment Framework */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Investment Framework</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Concentration is intentionally focused on the top tier of the S&P 500. We employ a disciplined, rules-based investment framework to capture the growth of the S&P top 25, complemented by a tactical enhancement overlay to optimize returns while controlling risk.
                    </p>
                  </div>
                </div>

                {/* Platform Vision Footer */}
                <div className="relative pt-6 mt-6 border-t border-white/10 text-xs text-muted-foreground">
                  <span className="text-primary font-semibold">Vision:</span> Build a public markets platform defined by discipline, transparency, and long-term stewardship.
                </div>
              </div>

              {/* 2. Nidhiksh Commercial Real Estate */}
              <div className="group relative p-8 rounded-3xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] flex flex-col h-full justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Commercial Real Estate</h2>
                  </div>

                  {/* Mandate Statement */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm italic text-amber-200/90 leading-relaxed">
                    "Committed to a disciplined, high-quality investment strategy centered on acquiring Class A commercial assets with strong fundamentals, resilient cash flow, and clear near-term appreciation potential."
                  </div>

                  {/* Core CRE Principles Section */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Core CRE Principles</h3>
                    <ul className="space-y-4 text-sm text-slate-300">
                      <li className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold text-white">Quality First</span>
                        </div>
                        <p className="pl-6 text-xs text-muted-foreground leading-relaxed">
                          Prioritizing Class A assets featuring modern design, strong tenant profiles, and minimal deferred maintenance for long-term durability.
                        </p>
                      </li>
                      <li className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold text-white">Cash Flow Stability</span>
                        </div>
                        <p className="pl-6 text-xs text-muted-foreground leading-relaxed">
                          Acquiring properties that generate reliable, predictable income from day one, forming the foundation for consistent investor returns.
                        </p>
                      </li>
                      <li className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold text-white">Strategic Timing</span>
                        </div>
                        <p className="pl-6 text-xs text-muted-foreground leading-relaxed">
                          Targeting assets early in their lifecycle to capture post-stabilization appreciation while avoiding late-cycle deterioration.
                        </p>
                      </li>
                      <li className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold text-white">Risk-Managed Value Creation</span>
                        </div>
                        <p className="pl-6 text-xs text-muted-foreground leading-relaxed">
                          Enhancing returns through structured depreciation, selective refinancing, and disciplined exits, while keeping focus on value appreciation.
                        </p>
                      </li>
                    </ul>
                  </div>

                  {/* Acquisition Focus */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Acquisition Focus</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      We focus on properties that combine modern construction, strong tenant credit, and durable occupancy. Through selective acquisitions and structured exit planning, we seek to deliver stable income and measurable value creation while maintaining a conservative risk posture.
                    </p>
                  </div>
                </div>

                {/* Platform Vision Footer */}
                <div className="relative pt-6 mt-6 border-t border-white/10 text-xs text-muted-foreground">
                  <span className="text-primary font-semibold">Vision:</span> Build a CRE platform defined by stability, transparency, and enduring value creation.
                </div>
              </div>

              {/* 3. Nidhiksh Private Ventures */}
              <div className="group relative p-8 rounded-3xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] flex flex-col h-full justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                      <Lightbulb className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Private Ventures</h2>
                  </div>

                  {/* Mandate Statement */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm italic text-amber-200/90 leading-relaxed">
                    "Built on a simple belief that people deserve better products, better services, and better opportunities. We are committed to creating and acquiring businesses that deliver value-driven solutions."
                  </div>

                  {/* Venture Mandate Section */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Venture Mandate</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Nidhiksh Private Ventures will establish, own, or acquire high-quality startups and private companies with the ability to scale, generate strong cash flow, and create long-term enterprise value. Our mandate is to identify ventures with exceptional upside potential.
                    </p>
                  </div>

                  {/* Operational Execution */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Operational Execution</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      We guide businesses with disciplined execution, operational excellence, and strategic leadership. As these companies grow, we evaluate the optimal path forward—whether through continued expansion or a strategic exit—always prioritizing sustainable value creation.
                    </p>
                  </div>

                  {/* Operating Structure */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Operating Structure</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Operating as a diversified group of companies, either founded internally or acquired with a majority ownership stake, unified under the Nidhiksh vision.
                    </p>
                  </div>
                </div>

                {/* Platform Vision Footer */}
                <div className="relative pt-6 mt-6 border-t border-white/10 text-xs text-muted-foreground">
                  <span className="text-primary font-semibold">Philosophy:</span> Grounded in ethics, integrity, and disciplined stewardship to scale private businesses driven by purpose.
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
