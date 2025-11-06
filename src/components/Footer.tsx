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
            <h3 className="font-heading text-xl font-bold mb-3">Blinkoo</h3>
            <p className="text-sm text-gray-400 mb-4">
              Pretvorite prazne sate u posjetitelje. Ekskluzivne vremenski ograničene ponude u lokalnim mjestima.
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
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Za Korisnike</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/offers" className="hover:text-white transition-colors">
                  Pregledaj Ponude
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  Kako Funkcionira
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  Često Postavljana Pitanja
                </Link>
              </li>
              <li>
                <Link href="/my-claims" className="hover:text-white transition-colors">
                  Moje Rezervacije
                </Link>
              </li>
            </ul>
          </div>

          {/* For Merchants */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Za Trgovce</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/merchant/dashboard" className="hover:text-white transition-colors">
                  Trgovački Nadzorni Panel
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup?role=merchant"
                  className="hover:text-white transition-colors"
                >
                  Postanite Trgovac
                </Link>
              </li>
              <li>
                <Link href="/#merchant-benefits" className="hover:text-white transition-colors">
                  Prednosti
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Pravno</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Uvjeti Korištenja
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Politika Privatnosti
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Kontaktirajte Nas
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#333] pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div>© 2024 Blinkoo. Sva prava pridržana.</div>
          <div className="mt-4 md:mt-0">Napravljeno s ❤️ za lokalna poslovanja</div>
        </div>
      </div>
    </footer>
  )
}
