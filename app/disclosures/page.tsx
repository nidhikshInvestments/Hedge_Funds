import { NavigationWrapper } from "@/components/navigation-wrapper"
import { Footer } from "@/components/footer"

export default function DisclosuresPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-slate-950">
      <div className="absolute inset-0 bg-black">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-600/20 blur-3xl" />
      </div>

      <div className="relative z-10">
        <NavigationWrapper />

        <main className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl p-8 md:p-12 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <h1 className="mb-6 text-3xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Disclosures
            </h1>
            <p className="mb-8 text-sm text-muted-foreground border-b border-border/40 pb-4">
              &copy; {new Date().getFullYear()} Nidhiksh Investments Inc. All Rights Reserved.
            </p>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                Nidhiksh Investments Inc. is an investment conglomerate operating through multiple subsidiary investment vehicles across public and private markets. The company is pursuing a long-term strategy to become a publicly traded investment holding company.
              </p>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Securities Offering</h2>
                <p>
                  Securities of Nidhiksh Investments Inc. are available exclusively to accredited investors as defined under Rule 506(c) of Regulation D of the Securities and Exchange Commission (17 C.F.R. § 230.506(c)). Nothing on this website constitutes an offer to sell or a solicitation to buy any security. Nidhiksh Investments Inc. provides investment opportunities in private securities exempt from the registration requirements of Section 5 of the Securities Act of 1933.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">State Availability</h2>
                <p>
                  Nidhiksh Investments Inc. accepts investments from all U.S. states. Upon onboarding the first investor from any given state, the required Blue Sky filing for that jurisdiction will be submitted promptly and within the applicable regulatory timeline.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Not Investment Advice</h2>
                <p>
                  The information and content provided on this website — including data, analysis, and commentary relating to investment approaches — is for informational purposes only. It does not constitute investment, legal, accounting, or tax advice and should not be relied upon as such. You should consult qualified professionals before making any investment decision.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Risk Disclosure</h2>
                <p>
                  No representation is made that any investment will or is likely to achieve profits or losses similar to those achieved in the past, or that significant losses will be avoided. No assurances or guarantees are given regarding the performance of any investment. Returns will fluctuate and are not guaranteed. Investing involves risk, including the possible loss of principal.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">No Government Insurance</h2>
                <p>
                  Investments made through Nidhiksh Investments Inc. are not insured or guaranteed by the U.S. government or any other governmental or regulatory body. Investments are not FDIC insured. Past performance is not indicative of future results.
                </p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
