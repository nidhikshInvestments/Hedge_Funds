import { NavigationWrapper } from "@/components/navigation-wrapper"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
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
              Privacy Statement
            </h1>
            <p className="mb-8 text-sm text-muted-foreground border-b border-border/40 pb-4">
              &copy; {new Date().getFullYear()} Nidhiksh Investments Inc. All Rights Reserved.
            </p>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <p>
                At Nidhiksh Investments Inc., we are committed to protecting your personal information and processing it responsibly. We appreciate the trust you place in us when sharing your information and are dedicated to treating it with the utmost respect.
              </p>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Site For Informational Purposes Only</h2>
                <div className="space-y-4">
                  <p>
                    The data, information, and content on this site are provided for general informational and educational purposes only and are subject to change without notice. Nothing on this site constitutes an offer to sell, or a solicitation of an offer to buy, any securities, financial instruments, investments, or other services. Information relating to investment approaches should not be construed as investment, legal, accounting, or tax advice.
                  </p>
                  <p>
                    The information provided does not account for the specific circumstances of any individual investor. You alone bear sole responsibility for evaluating the merits and risks associated with any data, information, or content on this site before making decisions based upon it. By using this site, you agree not to hold Nidhiksh Investments Inc. or its third-party content providers liable for any claim for damages arising from any decision you make based on information available here.
                  </p>
                  <p>
                    Any materials relating to investment opportunities described on this site should be read in conjunction with the applicable Private Placement Memorandum, which describes the investment and its associated risks in full. Please read it carefully before making any investment.
                  </p>
                  <p>
                    All content on this site is presented as of the date published and may be superseded by subsequent market events or other developments. You are responsible for configuring your browser cache settings to ensure you are viewing the most current information.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">Intellectual Property</h2>
                <div className="space-y-4">
                  <p>
                    Nidhiksh Investments Inc., and its affiliates where applicable, retains all right, title, and interest - including all related Intellectual Property Rights - in and to all content on this site and any content provided to you by Nidhiksh Investments Inc. This includes, without limitation, any suggestions, ideas, feedback, recommendations, or other information submitted by you or any third party.
                  </p>
                  <p>
                    Except as expressly stated herein, no intellectual property rights of any kind are granted to you. All rights are reserved by Nidhiksh Investments Inc.
                  </p>
                  <p>
                    All content on this site constitutes the proprietary, confidential, and copyrighted material of Nidhiksh Investments Inc. Violations of intellectual property law may result in injunctions, civil liability, forfeiture of profits, punitive damages, and other legal sanctions. Nidhiksh Investments Inc. reserves the right to take all appropriate legal action to enforce and protect its rights against any party that breaches these provisions.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
