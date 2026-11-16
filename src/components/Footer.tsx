import { Link } from 'react-router-dom';
import { openCookieSettingsModal } from '../lib/consent';

import { useI18n } from '../i18n/I18nContext';
export function Footer() {
  const { t } = useI18n();
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
              {t("Hisab Sutra")}
            </Link>
            <p className="text-sm text-teal-300 font-medium">
              {t("Formula for Next Generational Books")}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              {t("ACCA-led accounting, bookkeeping, and financial data entry teams based in Kathmandu, Nepal—supporting SMEs and accounting firms across the UK, Europe, and the Gulf.")}
            </p>
            <p className="text-xs text-slate-400 pt-1">
              {t("Kathmandu, Nepal")}
            </p>

            <a
              href="mailto:hisabsutra@bikasb.com.np"
              className="inline-flex text-sm text-slate-300 hover:text-white transition-colors"
            >
              hisabsutra@bikasb.com.np
            </a>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-white">{t("Services")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services#accounting" className="hover:text-white transition-colors">
                  {t("Accounting")}
                </Link>
              </li>
              <li>
                <Link to="/services#bookkeeping" className="hover:text-white transition-colors">
                  {t("Bookkeeping")}
                </Link>
              </li>
              <li>
                <Link to="/services#data-entry" className="hover:text-white transition-colors">
                  {t("Data Entry")}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  {t("Packages & Pricing")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-white">{t("Practice")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  {t("About & Team")}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  {t("FAQ")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  {t("Request a Quote")}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  {t("Admin Console")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-sm font-semibold text-white">{t("Legal & Privacy")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  {t("Privacy Policy")}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  {t("Terms of Service")}
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white transition-colors">
                  {t("Cookie Policy")}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookieSettingsModal}
                  className="text-start text-slate-300 hover:text-white transition-colors underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 rounded-sm"
                >
                  {t("Cookie Settings")}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {year} {t("Hisab Sutra. All rights reserved.")}</p>
          <p>{t("EU/UK hosted data storage for GDPR compliance · Kathmandu, Nepal (UTC+5:45)")}</p>
        </div>
      </div>
    </footer>
  );
}
