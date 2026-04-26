import { NavigationWrapper } from "@/components/navigation-wrapper"
import { Footer } from "@/components/footer"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog"

export default function TeamPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
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
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
                Our{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Team
                </span>
              </h1>
            </div>
          </div>
        </section>

        {/* True Professional Governance Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <div className="text-center mb-12">
                <div className="inline-block">
                  <h2 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    True Professional Governance
                  </h2>
                  <div className="w-full h-1.5 bg-gradient-to-r from-primary to-accent rounded-full" />
                </div>
              </div>

              <div className="relative rounded-3xl border-2 border-primary/30 bg-gradient-to-b from-card/90 to-card/60 p-8 md:p-12 backdrop-blur-xl shadow-[0_0_50px_rgba(245,158,11,0.15)]">
                <div className="space-y-6 text-lg md:text-xl text-muted-foreground">
                  <p className="text-pretty leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-1 first-letter:float-left">
                    The leadership of Nidhiksh Investments Inc. is built on a foundation of <strong className="text-white">true professional governance</strong>, disciplined decision-making, and an unwavering commitment to investor-first principles. Our team brings together seasoned professionals across strategic advisory, capital development, operations, and investment oversight - each aligned with the firm's long-term vision for sustainable growth.
                  </p>
                  <p className="text-pretty leading-relaxed">
                    Nidhiksh Investments Inc. operates under a governance framework defined <strong className="text-white">by Integrity, Discipline, Vision, and Financial Stewardship</strong>. Every decision is made with a singular focus: <strong className="text-white">protecting and advancing the interests of our investors</strong> while supporting the long-term growth of the firm and its subsidiaries.
                  </p>
                  <p className="text-pretty leading-relaxed">
                    <strong className="text-white">Strategic Advisory Excellence</strong> function is rooted in <strong className="text-white">deep experience, principled judgment, and disciplined financial professionalism</strong>. It brings seasoned insight, objective guidance, and a commitment to the highest standards of integrity, helping shape the strategic direction of the firm.
                  </p>
                  <p className="text-pretty leading-relaxed">
                    <strong className="text-white">Capital Development</strong> is led by <strong className="text-white">experienced professionals</strong> who operate with a shared commitment to mutual growth and long-term partnership. Their efforts are grounded in a thorough understanding of <strong className="text-white">Nidhiksh Investments' product, philosophy, and value proposition</strong>, ensuring that families receive the highest standard of wealth-building opportunities.
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

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Vishal Patel */}
              <Dialog>
                <DialogTrigger asChild>
                  <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] cursor-pointer text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 mb-4 shadow-lg shadow-primary/20">
                        <Image
                          src="/images/vishal-patel-ceo.jpg"
                          alt="Vishal Patel, Founder & CEO"
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">Vishal Patel</h3>
                      <p className="text-lg text-muted-foreground">Founder & CEO</p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-zinc-950 to-background border-primary/20 shadow-2xl">
                  <DialogHeader className="mb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl shrink-0">
                      <Image
                        src="/images/vishal-patel-ceo.jpg"
                        alt="Vishal Patel, Founder & CEO"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="text-center md:text-left pt-2">
                      <DialogTitle className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Vishal Patel</DialogTitle>
                      <p className="text-xl text-primary/90 font-semibold">Founder & CEO</p>
                    </div>
                  </DialogHeader>
                  <div className="text-base text-muted-foreground leading-relaxed space-y-4">
                    <p>
                      Vishal founded Nidhiksh Investments Inc. with a clear mission: to help investors preserve their wealth, generate annual dividend income, and build a legacy of wealth that endures across generations. The firm invests in public and private markets with a disciplined focus on controlled risk management and capital preservation.
                    </p>
                    <p>
                      Vishal Patel brings extensive experience from the IT sector, where he developed strong analytical, operational, and strategic execution skills while supporting major healthcare and insurance organizations, including UnitedHealth Group, Aetna, Anthem, Blue Cross Blue Shield, and Molina Healthcare. His work focused on optimizing systems, improving efficiency, and enabling large-scale technology initiatives.
                    </p>
                    <p>
                      He later transitioned these capabilities into entrepreneurship and investment, applying the same disciplined, strategic approach to wealth management, capital growth, and business leadership. Vishal has founded and led an IT consulting firm that connected top technical talent with leading companies, as well as a primary care clinic network, demonstrating his ability to build and scale businesses across industries.
                    </p>
                    <p>
                      Over the past several years, he has focused on the Public and Private Markets and investment strategy, developing advanced expertise in capital growth. His combined background in technology, healthcare, and finance positions him as a forward-thinking leader with a disciplined, innovation-driven approach to creating long-term value for Nidhiksh Investments Inc.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              {/* David Koch */}
              <Dialog>
                <DialogTrigger asChild>
                  <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] cursor-pointer text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 mb-4 shadow-lg shadow-primary/20">
                        <Image
                          src="/images/david-koch.jpg"
                          alt="David Koch"
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">David Koch</h3>
                      <p className="text-lg text-muted-foreground">Strategic Advisor</p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-zinc-950 to-background border-primary/20 shadow-2xl">
                  <DialogHeader className="mb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl shrink-0">
                      <Image
                        src="/images/david-koch.jpg"
                        alt="David Koch"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="text-center md:text-left pt-2">
                      <DialogTitle className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">David Koch</DialogTitle>
                      <p className="text-xl text-primary/90 font-semibold">Strategic Advisor</p>
                    </div>
                  </DialogHeader>
                  <div className="text-base text-muted-foreground leading-relaxed space-y-4">
                    <p>
                      David Koch is a seasoned International Investment Banker, with more than <strong className="text-zinc-200">25 years of experience</strong>, bringing deep strategic insight to Nidhiksh Investments Inc.
                    </p>
                    <p>
                      Throughout his career, David has raised over $100 billion in capital for clients and has relationships with over 2,500 investors. He founded Koch Capital Advisory in 2025 to advise on and execute private capital transactions.
                    </p>
                    <p>
                      Previously, David served as Head of Equity Capital Markets & Co-Head of Capital Markets at BGL from 2023 and led Global Equity Capital Markets at GP Bullhound for three years.
                    </p>
                    <p>
                      Prior to that David spent eleven years at Barclays in London, where he became a Managing Director in 2015 and led the Equity Capital Markets effort for Southern Europe. His career began at Lehman Brothers in NYC in 2002.
                    </p>
                    <p>
                      David received a Bachelor of Arts degree from Johns Hopkins University in 2002. He is currently a member of the advisory council for the Center for Financial Economics at JHU.
                    </p>
                    <p>
                      David holds Series 7, 24, 63 & 79 certifications from FINRA.
                      <br/>
                      <a href="https://linkedin.com/in/david-koch-1126831a0" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn profile</a>
                      <br/>
                      <a href="https://kochcapitaladvisory.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Company website</a>
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Bradley Briggs */}
              <Dialog>
                <DialogTrigger asChild>
                  <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] cursor-pointer text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 mb-4 shadow-lg shadow-primary/20">
                        <Image
                          src="/images/bradley-briggs.jpeg"
                          alt="Bradley Briggs"
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">Bradley Briggs</h3>
                      <p className="text-lg text-muted-foreground">Director, Investor Relations</p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-zinc-950 to-background border-primary/20 shadow-2xl">
                  <DialogHeader className="mb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl shrink-0">
                      <Image
                        src="/images/bradley-briggs.jpeg"
                        alt="Bradley Briggs"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="text-center md:text-left pt-2">
                      <DialogTitle className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Bradley Briggs</DialogTitle>
                      <p className="text-xl text-primary/90 font-semibold">Director, Investor Relations<br/>& Capital Development</p>
                    </div>
                  </DialogHeader>
                  <div className="text-base text-muted-foreground leading-relaxed space-y-4">
                    <p>
                      Bradley Briggs is an investment management professional with over seven years of experience in capital raising, investor relations, and advisor-focused distribution across public and private markets. He has worked extensively with RIAs, broker-dealers, family offices, and accredited investors, specializing in institutional engagement, portfolio strategy communication, and relationship development. He currently supports Nidhiksh Investments Inc. in its capital raising initiatives.
                    </p>
                    <p>
                      Bradley also serves as Director of Investor Relations at Cebron Group, where he leads investor engagement and capital development efforts for middle-market acquisition platforms. His responsibilities include capital structuring, strategic positioning for M&A transactions, and managing relationships with private equity firms and sophisticated investors. He works closely with deal teams on investment materials, platform strategy, and due diligence.
                    </p>
                    <p>
                      Previously, Bradley was a Regional Vice President and Hybrid Wholesaler at Zacks Investment Management, where he raised over $150 million in new assets by expanding advisor relationships and market reach. He also held roles at Merrill Lynch, Vanguard, Northwestern Mutual, and Fifth Third Bank.
                    </p>
                    <p>
                      Bradley began his career in the United States Marine Corps as an IAR Gunner, where he developed the discipline and leadership that continue to guide his professional approach. He holds FINRA Series 7, Series 63 and is working towards his CAIA designation.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Michael Schumacher */}
              <Dialog>
                <DialogTrigger asChild>
                  <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] cursor-pointer text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 mb-4 shadow-lg shadow-primary/20">
                        <Image
                          src="/images/michael-schumacher.jpeg"
                          alt="Michael Schumacher"
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">Michael Schumacher</h3>
                      <p className="text-lg text-muted-foreground">Director, Investor Relations</p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-zinc-950 to-background border-primary/20 shadow-2xl">
                  <DialogHeader className="mb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-xl shrink-0">
                      <Image
                        src="/images/michael-schumacher.jpeg"
                        alt="Michael Schumacher"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="text-center md:text-left pt-2">
                      <DialogTitle className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Michael Schumacher</DialogTitle>
                      <p className="text-xl text-primary/90 font-semibold">Director, Investor Relations<br/>& Capital Development</p>
                    </div>
                  </DialogHeader>
                  <div className="text-base text-muted-foreground leading-relaxed space-y-4">
                    <p>
                      Michael is an accomplished entrepreneur, CFO, podcaster, author, and business and financial leader. He and his team focus on the world of finance and M&A in support of fellow entrepreneurs. He holds a BAA and MBA; and is ABD in his DBA. Michael's career blends in Fortune 50 executive leadership with deep entrepreneurial and capital advisory experience. That background in managing complex distribution channels, developing high-performance teams, and executing growth strategies across diverse markets forms the operational foundation he brings to Nidhiksh Investments Inc.
                    </p>
                    <p>
                      Following his corporate tenure, Michael served as CFO and COO at a $250M company before founding multiple companies. In these roles, he has operated as Chairman, Contract CEO and CFO, and strategic advisor to a wide range of businesses.
                    </p>
                    <p>
                      Michael is a recognized thought leader in business finance and operations. He is the host of the nationally syndicated <a href="#" className="text-primary hover:underline">"Small and Mid-Sized Business Capital and Exits" podcast</a> and the <a href="#" className="text-primary hover:underline">author of numerous books available on Amazon/Kindle</a>.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
