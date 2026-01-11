import Link from "next/link"
import { Building2, Mail, Phone } from "lucide-react"

export function DashboardFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-slate-950/50 backdrop-blur-xl mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-2 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Nidhiksh Investments</span>
            </div>
            <p className="text-sm text-slate-400">
              Where <span className="text-red-500">Trust</span> Meets An Opportunity And{" "}
              <span className="text-blue-500">Growth</span> Becomes Legacy.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-slate-400 hover:text-amber-400 transition-colors">
                Home
              </Link>
              <Link href="/about" className="block text-sm text-slate-400 hover:text-amber-400 transition-colors">
                About Us
              </Link>
              <Link href="/invest" className="block text-sm text-slate-400 hover:text-amber-400 transition-colors">
                Invest
              </Link>
              <Link href="/contact" className="block text-sm text-slate-400 hover:text-amber-400 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <div className="space-y-2">
              <Link href="#" className="block text-sm text-slate-400 hover:text-amber-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="block text-sm text-slate-400 hover:text-amber-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="block text-sm text-slate-400 hover:text-amber-400 transition-colors">
                Disclosures
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <div className="space-y-3">
              <a
                href="mailto:nidhiksh.investments@gmail.com"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Mail className="h-4 w-4" />
                nidhiksh.investments@gmail.com
              </a>
              <a
                href="tel:4695148785"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Phone className="h-4 w-4" />
                469-514-8785
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-slate-400">
          <p>&copy; 2026 Nidhiksh Investments. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
