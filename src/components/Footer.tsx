import { Link } from 'react-router-dom';
import { openCookieSettingsModal } from '../lib/consent';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0B1F3A] text-slate-300 border-t border-slate-800">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          <div className="md:col-span-5 space-y-3">
            <Link
              to="/"
              className="inline-block text-lg font-bold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-400 rounded-sm"
            >
              Hisab Sutra
            </Link>
            <p className="text-sm text-teal-300 font-medium">
              Formula for Next Generational Books
            </p>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              ACCA-led accounting, bookkeeping, and financial data entry teams based in Kathmandu,
              Nepal—supporting SMEs and accounting firms across the UK, Europe, and the Gulf.
            </p>
            <p className="text-xs text-slate-400 pt-1">
              [Kathmandu Registered Office Address Placeholder] · [hello@hisabsutra.com Placeholder]
            </p>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-white">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services#accounting" className="hover:text-white transition-colors">
                  Accounting
                </Link>
              </li>
              <li>
                <Link to="/services#bookkeeping" className="hover:text-white transition-colors">
                  Bookkeeping
                </Link>
              </li>
              <li>
                <Link to="/services#data-entry" className="hover:text-white transition-colors">
                  Data Entry
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Packages &amp; Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-white">Practice</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About &amp; Team
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-sm font-semibold text-white">Legal &amp; Privacy</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookieSettingsModal}
                  className="text-left text-slate-300 hover:text-white transition-colors underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 rounded-sm"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {year} Hisab Sutra. All rights reserved.</p>
          <p>EU/UK hosted data storage for GDPR compliance · Kathmandu, Nepal (UTC+5:45)</p>
        </div>
      </div>
    </footer>
  );
}
