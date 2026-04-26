import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, Users, Mail, Phone, Sparkles, Handshake, Gem, Star } from "lucide-react"
import { NavigationWrapper } from "@/components/navigation-wrapper"
import { Footer } from "@/components/footer"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-600/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-yellow-500/30 to-amber-600/30 blur-3xl animation-delay-2000" />
      </div>

      <div className="relative z-10">
        <NavigationWrapper />

        {/* Hero Section */}
        <section id="home" className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="container relative mx-auto px-4">
            <div className="flex flex-col items-center text-center gap-8 max-w-5xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-xl font-medium text-foreground">Welcoming Investors Nationwide</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight">
                <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent animate-gradient">
                  Welcome To
                </span>
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent animate-gradient">
                  Nidhiksh Investments
                </span>
              </h1>

              <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl text-pretty">
                Where Trust Meets An Opportunity And Growth Becomes Legacy.
              </p>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent px-8 text-xl transition-opacity hover:opacity-90"
                >
                  <Link href="/signup">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary/40 hover:border-primary hover:bg-primary/10 px-8 text-xl backdrop-blur-sm transition-all bg-transparent"
                >
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <div className="text-center mb-12">
                <div className="inline-block">
                  <h2 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    Our Vision
                  </h2>
                  <div className="w-full h-1.5 bg-gradient-to-r from-primary to-accent rounded-full" />
                </div>
              </div>

              <div className="relative rounded-3xl border-2 border-primary/30 bg-gradient-to-b from-card/90 to-card/60 p-8 md:p-12 backdrop-blur-xl shadow-[0_0_50px_rgba(245,158,11,0.15)]">
                <div className="space-y-6 text-lg md:text-xl text-muted-foreground">
                  <p className="text-pretty leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-1 first-letter:float-left">
                    Nidhiksh Investments Inc. is a diversified investment holding company pursuing a long-term strategy to become a publicly traded institution - a structure purpose-built for multigenerational wealth creation.
                  </p>
                  <p className="text-pretty leading-relaxed">
                    We are founded on a singular principle: growth must be mutual. Our investors' success and our organization's success are not separate goals - they are one and the same. This alignment shapes every investment we make, every relationship we build, and every decision we take with our investors' interests first.
                  </p>
                  <p className="text-pretty leading-relaxed">
                    We operate at the intersection of performance and principle. Guided by an unwavering commitment to ethics, transparency, and integrity, we hold ourselves to the highest standards - not because it is required, but because it is right. Trust, in our view, is not a feature of what we do. It is the foundation.
                  </p>
                  <p className="text-pretty leading-relaxed">
                    Our investment philosophy is equally clear: deliver exceptional, risk-adjusted returns through a disciplined Capital Preservation Strategy. We protect what has been built. We compound what comes next. And we do it with the long view in mind - measured not in quarters, but in generations.
                  </p>
                  <p className="text-pretty leading-relaxed">
                    At Nidhiksh, we are not simply managing capital. We are building lasting partnerships grounded in clarity, accountability, and shared purpose. We succeed when you succeed - and that is a commitment we take seriously across every market cycle, every portfolio decision, and every conversation we have with the people who have placed their trust in us.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="invest" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Nidhiksh?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built on principles of transparency, integrity, and mutual success.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                    <Handshake className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">Mutual Growth</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Shared success drives every decision we make with investor's interest in focus. Target high yield return.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-accent/20 hover:border-accent/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-6 shadow-lg shadow-accent/20">
                    <Gem className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">Ethics & Honesty</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Unwavering professional conduct at all times.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                    <Star className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">Shared Success</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We profit only when our investors profit.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-accent/20 hover:border-accent/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-6 shadow-lg shadow-accent/20">
                    <Shield className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">Capital Preservation Strategy</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Protect the downside, capture the upside, pass wealth to next generation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-5xl rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl p-8 md:p-12">
            <div className="flex flex-col items-center gap-6 text-center">
              <h2 className="max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">Get In Touch</h2>
              <p className="max-w-xl text-pretty text-xl text-muted-foreground">
                Have questions about investing with Nidhiksh? We are here to help you begin your investment journey.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-8 justify-center items-center w-full">
                <a
                  href="mailto:info@nidhiksh-investments.com"
                  className="flex items-center gap-2 text-xl font-medium hover:text-primary transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  info@nidhiksh-investments.com
                </a>
                <a
                  href="tel:469-514-8785"
                  className="flex items-center gap-2 text-xl font-medium hover:text-primary transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  469-514-8785
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl" />
              <div className="relative rounded-3xl border-2 border-primary/30 bg-gradient-to-b from-card/90 to-card/60 p-12 text-center backdrop-blur-xl md:p-16 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                <h2 className="mb-6 text-balance text-3xl font-bold md:text-5xl">Ready to Start Investing?</h2>
                <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
                  Join Nidhiksh Investments today and experience exceptional returns with complete capital preservation strategy.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent px-8 text-xl transition-opacity hover:opacity-90"
                  >
                    <Link href="/signup">
                      Create Account <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-2 border-primary/40 hover:border-primary hover:bg-primary/10 px-8 text-xl transition-all bg-transparent"
                  >
                    <Link href="/login">Existing Investor Login</Link>
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
