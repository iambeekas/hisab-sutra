import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

import { useI18n } from '../i18n/I18nContext';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { ThemeToggle } from '../i18n/theme';
const NAV_LINKS = [
  { to: '/services', label: 'Services' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export function Header() {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handlePrimaryCta = () => {
    void trackEvent('cta_click', { label: 'header_get_a_quote' });
    setMobileOpen(false);
    navigate('/contact');
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-line-200/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single clean wordmark */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="text-lg font-bold tracking-tight text-navy-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 rounded-sm"
        >
          <span className="inline-flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-lg bg-[#0B1F3A] dark:bg-teal-400/15 dark:ring-1 dark:ring-teal-300/30 text-[13px] font-extrabold tracking-tight text-teal-300"
            >
              {t("HS")}
            </span>
            {t("Hisab Sutra")}
          </span>
        </Link>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav
          aria-label={t("Primary navigation")}
          className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-600"
        >
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 ${
                  isActive
                    ? 'text-navy-900 border-accent-700 font-semibold'
                    : 'border-transparent hover:text-navy-900 hover:border-line-300'
                }`
              }
            >
              {t(item.label)}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher className="hidden md:inline-flex" />
          <ThemeToggle label={{ toDark: t('Switch to dark mode'), toLight: t('Switch to light mode') }} />
          <button
            type="button"
            onClick={handlePrimaryCta}
            className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white btn-primary rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {t("Get a Quote")}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t('Close navigation menu') : t('Open navigation menu')}
            className="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-ink-700 hover:bg-paper-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-line-200 bg-surface px-4 py-4">
          <nav aria-label={t("Mobile navigation")} className="flex flex-col gap-1">
            <LanguageSwitcher className="mb-2 w-full [&>select]:w-full" />
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center ${
                    isActive
                      ? 'bg-paper-100 text-navy-900 font-semibold'
                      : 'text-ink-700 hover:bg-paper-50'
                  }`
                }
              >
                {t(item.label)}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handlePrimaryCta}
              className="mt-2 w-full px-4 py-2.5 text-sm font-semibold text-white btn-primary rounded-lg transition-colors min-h-[44px]"
            >
              {t("Get a Quote")}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
