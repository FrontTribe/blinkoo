import Link from 'next/link'
import { MdLocationOn, MdEmail, MdPhone } from 'react-icons/md'
import { BiStore } from 'react-icons/bi'

export function Footer() {
  return (
    <footer className="bg-text-primary text-white border-t border-[#333]">
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-heading text-xl font-bold mb-3">Off-Peak</h3>
            <p className="text-sm text-gray-400 mb-4">
              Turn cold hours into foot traffic. Exclusive time-boxed offers at local venues.
            </p>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-[#333] flex items-center justify-center">
                <span className="text-xs">fb</span>
              </div>
              <div className="w-8 h-8 bg-[#333] flex items-center justify-center">
                <span className="text-xs">ig</span>
              </div>
              <div className="w-8 h-8 bg-[#333] flex items-center justify-center">
                <span className="text-xs">tw</span>
              </div>
            </div>
          </div>

          {/* For Users */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">For Users</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/offers" className="hover:text-white transition-colors">
                  Browse Offers
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/my-claims" className="hover:text-white transition-colors">
                  My Claims
                </Link>
              </li>
            </ul>
          </div>

          {/* For Merchants */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">For Merchants</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/merchant/dashboard" className="hover:text-white transition-colors">
                  Merchant Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup?role=merchant"
                  className="hover:text-white transition-colors"
                >
                  Become a Merchant
                </Link>
              </li>
              <li>
                <Link href="/#merchant-benefits" className="hover:text-white transition-colors">
                  Benefits
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#333] pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div>© 2024 Off-Peak. All rights reserved.</div>
          <div className="mt-4 md:mt-0">Made with ❤️ for local businesses</div>
        </div>
      </div>
    </footer>
  )
}
