import { NavigationWrapper } from "@/components/navigation-wrapper"
import { Footer } from "@/components/footer"
import { Shield, Target, Heart, TrendingUp } from "lucide-react"
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
                  Nidhiksh Investments is founded on the principle of{" "}
                  <strong className="text-primary">mutual growth and shared success</strong>, for both our investors and
                  our organization. Guided by a foundation of ethics, transparency, and honesty, we are committed to
                  upholding the highest standards of integrity in everything we do.
                </p>
                <p className="text-muted-foreground">
                  Our vision is clear: We deliver{" "}
                  <strong className="text-primary">exceptional returns while safeguarding investor capital</strong>. We
                  provide a secure investment environment where principal amounts are protected and higher
                  performance-based annual profits, fostering long-term financial confidence.
                </p>
                <p className="text-muted-foreground">
                  Nidhiksh Investments proudly welcomes investors from{" "}
                  <strong className="text-primary">All States across the United States</strong>.
                </p>
                <p className="text-muted-foreground">
                  At Nidhiksh, we believe{" "}
                  <strong className="text-primary">trust is the cornerstone of every partnership</strong>. That's why we
                  operate with full accountability, ensuring investor interests remain at the forefront of every
                  strategic decision. Our mission is to create lasting relationships built on clarity, confidence, and
                  sustainable growth.
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
                    <Shield className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Integrity & Ethics</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Operating with complete transparency and honesty, ensuring every decision upholds the highest
                    ethical standards.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-accent/20 hover:border-accent/50 transition-all hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
                    <Target className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Performance Focus</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Dedicated to delivering exceptional returns through strategic decision-making and rigorous analysis.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                    <Heart className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Investor-Centric</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your interests and goals are at the heart of every strategy, ensuring alignment and mutual success.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-accent/20 hover:border-accent/50 transition-all hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
                    <TrendingUp className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Sustainable Growth</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Building lasting relationships through consistent performance and long-term value creation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Leadership</h2>
              <p className="text-xl text-muted-foreground">
                Led by experienced professionals committed to your success.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="group relative p-8 md:p-12 rounded-3xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl" />
                    <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl shadow-primary/20">
                      <Image
                        src="/images/vishal-patel-ceo.jpg"
                        alt="Vishal Patel, CEO of Nidhiksh Investments"
                        width={192}
                        height={192}
                        className="object-cover w-full h-full"
                        priority
                      />
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Vishal Patel
                  </h3>
                  <p className="text-2xl text-primary/90 font-semibold mb-4">Chief Executive Officer</p>

                  <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mb-6" />

                  <div className="text-lg font-medium text-muted-foreground leading-relaxed w-full space-y-4 text-left">
                    <p>
                      Vishal Patel brings many years of professional experience in the IT sector, where he developed a
                      strong foundation in analytical thinking, problem-solving, and strategic execution. Throughout his
                      career, he has contributed to some of the nation's leading healthcare and insurance organizations,
                      including UnitedHealth Group, Cigna, Anthem, Blue Cross Blue Shield, and Molina Healthcare. In
                      these roles, Vishal played a key part in optimizing systems, improving operational efficiency, and
                      supporting large-scale technology initiatives that directly impacted patient care and
                      organizational performance.
                    </p>
                    <p>
                      Building on this expertise, Vishal transitioned his skills into entrepreneurship and investment,
                      applying the same discipline and strategic mindset to wealth management, capital growth, and
                      business leadership. His unique blend of technology, healthcare, and financial acumen positions
                      him as a versatile leader with the vision to drive sustainable success across industries.
                    </p>
                    <p>
                      In addition to his corporate career, Vishal founded and successfully led an IT consulting firm,
                      where he specialized in connecting highly skilled professionals with opportunities at leading
                      technology companies. Under his leadership, the firm became a trusted partner for both clients and
                      candidates, helping numerous professionals to advance their careers while strengthening the talent
                      pipelines of top organizations. This venture not only showcased his entrepreneurial drive but also
                      highlighted his commitment to developing people, fostering growth, and creating long‑term value.
                    </p>
                    <p>
                      Further diversifying his entrepreneurial portfolio, Vishal founded and expanded into healthcare by
                      establishing a primary care clinic network, showcasing his ability to successfully build and
                      manage ventures beyond the technology sector.
                    </p>
                    <p>
                      Over the past five years, Vishal has strategically applied his skills to the stock market,
                      developing advanced expertise in wealth management and capital growth. By combining his versatile
                      background, he has built a reputation as a forward‑thinking leader who leverages innovation,
                      disciplined strategy, and resilience to deliver sustainable success.
                    </p>
                  </div>
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
