import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, Clock, FileCheck2, Globe2, Lock } from 'lucide-react';
import {
  CURRENCIES,
  CurrencyCode,
  FAQ_ITEMS,
  HOW_IT_WORKS_STEPS,
  PRICING_TIERS,
  SERVICES,
  SITE_IMAGES,
  TESTIMONIAL_PLACEHOLDERS,
} from '../data/siteData';
import { trackEvent } from '../lib/analytics';
import { CurrencyToggle } from '../components/CurrencyToggle';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { IllustrativeBadge } from '../components/IllustrativeBadge';
import { SeoHead } from '../components/SeoHead';

import { useI18n } from '../i18n/I18nContext';
import { renderTemplate } from '../i18n/template';
export function HomePage() {
  const { t } = useI18n();
  const [currency, setCurrency] = useState<CurrencyCode>('GBP');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const realTestimonials = TESTIMONIAL_PLACEHOLDERS.filter((t) => !t.quote.trim().startsWith('['));

  return (
    <>
      <SeoHead
        title={t("Hisab Sutra – ACCA-Led Accounting Outsourcing from Nepal")}
        description={t("Formula for Next Generational Books. Outsource accounting, bookkeeping, and data entry to ACCA-qualified teams in Nepal for UK, European, and Gulf businesses.")}
        canonicalPath="/"
      />

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-line-200 bg-hero">
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 pb-10 sm:pt-14 sm:pb-12 lg:pt-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-6">
              <p className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden="true" />
                {t("Formula for Next Generational Books")}
              </p>

              <h1 className="text-[clamp(2.1rem,4vw,3.15rem)] font-extrabold tracking-tight text-navy-900 leading-[1.08] text-balance">
                {renderTemplate(t("ACCA-led accounting & bookkeeping pods for {region} teams."), {
                  region: <span className="text-accent-700">{t("UK, European, and Gulf")}</span>,
                })}
              </h1>

              <p className="text-base sm:text-lg text-ink-600 leading-relaxed max-w-xl">
                {t("Reliable monthly close, multi-currency reconciliations, and high-accuracy financial data entry delivered from Kathmandu—built around Xero, QuickBooks, Sage, and Zoho Books with EU/UK GDPR data residency.")}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/contact?intent=call"
                  onClick={() => void trackEvent('cta_click', { label: 'hero_book_free_15min_call' })}
                  className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl min-h-[48px] whitespace-nowrap shrink-0"
                >
                  {t("Book a Free 15-Minute Call")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/contact"
                  onClick={() => void trackEvent('cta_click', { label: 'hero_get_a_quote' })}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-navy-900 bg-surface border border-line-300 hover:border-navy-900 hover:bg-paper-50 rounded-xl transition-colors min-h-[48px] whitespace-nowrap shrink-0"
                >
                  {t("Get a Quote")}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <figure className="relative">
                <div className="relative rounded-2xl overflow-hidden ring-1 ring-ink-900/10 shadow-[0_28px_60px_-28px_rgb(11_31_58/0.45)] aspect-[5/4] bg-paper-100">
                  <ImageWithFallback
                    src={SITE_IMAGES.heroStudio}
                    alt={t("Illustration of an ACCA-led accounting team working in a Kathmandu office")}
                    loading="eager"
                    width={1200}
                    height={670}
                    className="w-full h-full object-cover"
                  />
                  <IllustrativeBadge />
                </div>
                <div className="absolute -bottom-5 end-4 sm:end-8 card flex items-center gap-3 px-4 py-3">
                  <FileCheck2 className="h-5 w-5 text-accent-700 shrink-0" aria-hidden="true" />
                  <p className="text-xs leading-snug text-ink-600">
                    <span className="block text-sm font-semibold text-navy-900">{t("ACCA-led review")}</span>
                    {t("Every monthly close")}
                  </p>
                </div>
              </figure>
            </div>
          </div>

          {/* 2. Trust Bar */}
          <div className="card mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-line-200">
            {[
              { Icon: FileCheck2, title: 'ACCA-Led Review', text: 'Monthly reporting supervised by qualified ACCA members.' },
              { Icon: Lock, title: 'GDPR & Strict NDA', text: 'EU/UK database residency; documents exchanged by email only.' },
              { Icon: Clock, title: 'Direct Time-Zone Overlap', text: 'Live working overlap across Gulf, European, and UK morning hours.' },
              { Icon: Globe2, title: 'Cloud Ledger Native', text: 'Xero · QuickBooks · Sage · Zoho Books · Excel' },
            ].map(({ Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3 p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-50 text-accent-700">
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{t(title)}</p>
                  <p className="text-xs text-ink-600 mt-0.5 leading-relaxed">{t(text)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Services Section */}
      <section className="py-16 sm:py-20 bg-paper-50 border-b border-line-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <h2 className="section-heading text-2xl sm:text-[2rem] text-balance">
                {t("Core Outsourcing Services")}
              </h2>
              <p className="text-ink-600 text-base">
                {t("Structured finance execution for growing businesses and accounting practices.")}
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-800 hover:text-accent-900 whitespace-nowrap shrink-0"
            >
              {t("Explore service workflows")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {SERVICES.map((service) => (
              <article
                key={service.id}
                className="card card-hover p-6 sm:p-7 flex flex-col justify-between space-y-6 lg:col-span-4"
              >
                <div className="space-y-3">
                  <p className="text-xs font-mono font-semibold text-accent-700 tabular-nums">
                    {service.number}. {t("Service Line")}
                  </p>
                  <h3 className="text-xl font-bold text-navy-900">{t(service.title)}</h3>
                  <p className="text-sm text-ink-600 leading-relaxed">{t(service.summary)}</p>
                  <ul className="pt-2 space-y-2">
                    {service.deliverables.slice(0, 3).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-ink-700">
                        <Check
                          className="h-4 w-4 text-accent-700 mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{t(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-line-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-ink-500">{service.tools.slice(0, 3).join(' · ')}</span>
                  <Link
                    to={`/services#${service.id}`}
                    className="text-xs font-semibold text-navy-900 hover:text-accent-700 whitespace-nowrap shrink-0"
                  >
                    {t("Details →")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works (4 Steps) */}
      <section className="py-16 sm:py-20 bg-surface border-b border-line-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="section-heading text-2xl sm:text-[2rem] text-balance">
              {t("How Onboarding & Monthly Execution Work")}
            </h2>
            <p className="text-ink-600">
              {t("A predictable four-step transition from discovery call to review-ready monthly close.")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div
                key={item.step}
                className="card card-hover p-6 space-y-3"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0B1F3A] dark:bg-teal-400/15 dark:ring-1 dark:ring-teal-300/30 font-mono text-sm font-semibold text-teal-300 tabular-nums">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-navy-900">{t(item.title)}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{t(item.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Pricing Preview */}
      <section className="py-16 sm:py-20 bg-paper-50 border-b border-line-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <h2 className="section-heading text-2xl sm:text-[2rem] text-balance">
                {t("Transparent Monthly Engagement Tiers")}
              </h2>
              <p className="text-ink-600 text-sm sm:text-base">
                {t("Indicative starting packages. Final quotes are tailored to entity count, software, and transaction volume.")}
              </p>
            </div>
            <CurrencyToggle currency={currency} onChange={setCurrency} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier) => {
              const amount = tier.monthlyPrices[currency];
              const symbol = CURRENCIES[currency].symbol;
              return (
                <div
                  key={tier.id}
                  className={`card relative p-6 sm:p-7 flex flex-col justify-between space-y-6 ${
                    tier.highlighted ? 'ring-2 ring-navy-900 shadow-[0_22px_44px_-20px_rgb(11_31_58/0.35)]' : ''
                  }`}
                >
                  {tier.highlighted && (
                    <span className="absolute -top-3 start-6 rounded-full bg-[#0B1F3A] dark:bg-teal-400 dark:text-[#04141f] px-3 py-1 text-[11px] font-semibold text-teal-300">
                      {t("Recommended")}
                    </span>
                  )}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-accent-800">{t(tier.audience)}</p>
                      <h3 className="text-xl font-bold text-navy-900 mt-1">{t(tier.name)}</h3>
                    </div>

                    <div className="flex items-baseline gap-1.5 pb-4 border-b border-line-100">
                      <span className="text-xs text-ink-500">{t("From")}</span>
                      <span className="text-3xl font-bold text-navy-900 font-mono tabular-nums">
                        {symbol}
                        {amount.toLocaleString('en-GB')}
                      </span>
                      <span className="text-xs text-ink-500">{t("/ month")}</span>
                    </div>

                    <div className="text-xs text-ink-600 space-y-1">
                      <p className="font-semibold text-ink-800">{t(tier.volumeLimit)}</p>
                      <p>{t(tier.turnaround)}</p>
                    </div>

                    <ul className="space-y-2.5 pt-2">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm text-ink-700">
                          <Check
                            className="h-4 w-4 text-accent-700 mt-0.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{t(feat)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to={`/contact?service=${encodeURIComponent(
                      tier.serviceMapping
                    )}&tier=${encodeURIComponent(tier.name)}`}
                    onClick={() =>
                      void trackEvent('cta_click', { label: `pricing_preview_${tier.id}` })
                    }
                    className={`w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors min-h-[44px] ${
                      tier.highlighted
                        ? 'btn-primary'
                        : 'bg-paper-100 text-navy-900 hover:bg-paper-200'
                    }`}
                  >
                    {t("Request a Quote")}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Testimonials (shown only once real quotes replace the [placeholders] in siteData.ts) */}
      {realTestimonials.length > 0 && (
        <section className="py-16 sm:py-20 bg-surface border-b border-line-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="section-heading text-2xl sm:text-[2rem]">
              {t("Client & Practice Partner Perspectives")}
            </h2>
            <p className="text-sm text-ink-600">
              {t("Verified client endorsements will be published here as engagements complete.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {realTestimonials.map((item, idx) => (
              <blockquote
                key={idx}
                className="bg-paper-50 border border-line-200 rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-5"
              >
                <p className="text-sm sm:text-base text-ink-700 leading-relaxed">{item.quote}</p>
                <footer className="pt-4 border-t border-line-200 text-xs text-ink-600">
                  <span className="font-semibold text-navy-900">{item.author}</span>
                  <span className="mx-2" aria-hidden="true">
                    ·
                  </span>
                  <span>{item.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* 7. FAQ Preview */}
      <section className="py-16 sm:py-20 bg-paper-50 border-b border-line-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-3">
              <h2 className="section-heading text-2xl sm:text-[2rem]">
                {t("Frequently Asked Questions")}
              </h2>
              <p className="text-sm text-ink-600 leading-relaxed">
                {t("Straight answers on GDPR data protection, ACCA quality oversight, supported cloud ledgers, and onboarding speed.")}
              </p>
              <Link
                to="/faq"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-800 hover:text-accent-900 pt-1"
              >
                {t("Read all FAQs")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="lg:col-span-8 space-y-3">
              {FAQ_ITEMS.slice(0, 4).map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={t(faq.question)}
                    className="card overflow-hidden"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-start flex items-center justify-between gap-4 hover:bg-paper-50 transition-colors min-h-[52px]"
                    >
                      <span className="text-sm sm:text-base font-semibold text-navy-900">
                        {t(faq.question)}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-ink-500 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-sm text-ink-600 leading-relaxed border-t border-line-100 pt-3">
                        {t(faq.answer)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Final Call to Action */}
      <section className="bg-[#0B1F3A] text-white py-16 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
              {t("Ready for review-ready books every month?")}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {t("Schedule a 15-minute scope call or request a tailored fixed-fee quote for your UK, European, or Gulf entity.")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/contact?intent=call"
              onClick={() => void trackEvent('cta_click', { label: 'footer_cta_book_call' })}
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-navy-900 bg-teal-300 hover:bg-accent-200 rounded-lg transition-colors min-h-[44px] whitespace-nowrap shrink-0"
            >
              {t("Book a Free 15-Minute Call")}
            </Link>
            <Link
              to="/contact"
              onClick={() => void trackEvent('cta_click', { label: 'footer_cta_get_quote' })}
              className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-white border border-slate-500 hover:bg-slate-800 rounded-lg transition-colors min-h-[44px] whitespace-nowrap shrink-0"
            >
              {t("Get a Quote")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
