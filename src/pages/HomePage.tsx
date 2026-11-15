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
import { SeoHead } from '../components/SeoHead';

export function HomePage() {
  const [currency, setCurrency] = useState<CurrencyCode>('GBP');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <>
      <SeoHead
        title="Hisab Sutra – ACCA-Led Accounting Outsourcing from Nepal"
        description="Formula for Next Generational Books. Outsource accounting, bookkeeping, and data entry to ACCA-qualified teams in Nepal for UK, European, and Gulf businesses."
        canonicalPath="/"
      />

      {/* 1. Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-wide text-teal-800">
                Hisab Sutra · Formula for Next Generational Books
              </p>

              <h1 className="text-[clamp(2.15rem,4vw,3.5rem)] font-bold tracking-tight text-[#0B1F3A] leading-[1.1] text-balance">
                ACCA-led accounting &amp; bookkeeping pods for UK, European, and Gulf teams.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Reliable monthly close, multi-currency reconciliations, and high-accuracy financial
                data entry delivered from Kathmandu—built around Xero, QuickBooks, Sage, and Zoho
                Books with EU/UK GDPR data residency.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/contact?intent=call"
                  onClick={() =>
                    void trackEvent('cta_click', { label: 'hero_book_free_15min_call' })
                  }
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0B1F3A] hover:bg-[#132F54] rounded-lg transition-colors min-h-[44px] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  Book a Free 15-Minute Call
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/contact"
                  onClick={() => void trackEvent('cta_click', { label: 'hero_get_a_quote' })}
                  className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-[#0B1F3A] bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  Get a Quote
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 flex">
              <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/10] lg:aspect-auto">
                <ImageWithFallback
                  src={SITE_IMAGES.heroStudio}
                  alt="Hisab Sutra accounting and financial advisory team working in Kathmandu studio"
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 2. Trust Bar */}
          <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <FileCheck2 className="h-5 w-5 text-teal-700 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[#0B1F3A]">ACCA-Led Review</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Monthly reporting supervised by qualified ACCA members.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-teal-700 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[#0B1F3A]">GDPR &amp; Strict NDA</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  EU/UK database residency; documents exchanged by email only.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-teal-700 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[#0B1F3A]">Direct Time-Zone Overlap</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Live working overlap across Gulf, European, and UK morning hours.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe2 className="h-5 w-5 text-teal-700 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[#0B1F3A]">Cloud Ledger Native</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Xero · QuickBooks · Sage · Zoho Books · Excel
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Services Section */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1F3A] text-balance">
                Core Outsourcing Services
              </h2>
              <p className="text-slate-600 text-base">
                Structured finance execution for growing businesses and accounting practices.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-900 whitespace-nowrap shrink-0"
            >
              Explore service workflows
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {SERVICES.map((service, idx) => (
              <article
                key={service.id}
                className={`bg-white border border-slate-200 rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 ${
                  idx === 0 ? 'lg:col-span-5' : idx === 1 ? 'lg:col-span-4' : 'lg:col-span-3'
                }`}
              >
                <div className="space-y-3">
                  <p className="text-xs font-mono font-semibold text-teal-700 tabular-nums">
                    {service.number}. Service Line
                  </p>
                  <h3 className="text-xl font-bold text-[#0B1F3A]">{service.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{service.summary}</p>
                  <ul className="pt-2 space-y-2">
                    {service.deliverables.slice(0, 3).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check
                          className="h-4 w-4 text-teal-700 mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">{service.tools.slice(0, 3).join(' · ')}</span>
                  <Link
                    to={`/services#${service.id}`}
                    className="text-xs font-semibold text-[#0B1F3A] hover:text-teal-700 whitespace-nowrap shrink-0"
                  >
                    Details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works (4 Steps) */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1F3A] text-balance">
              How Onboarding &amp; Monthly Execution Work
            </h2>
            <p className="text-slate-600">
              A predictable four-step transition from discovery call to review-ready monthly close.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div
                key={item.step}
                className="border border-slate-200 rounded-xl p-6 bg-slate-50/60 space-y-3"
              >
                <span className="inline-block font-mono text-sm font-semibold text-teal-700 tabular-nums">
                  Step {item.step}
                </span>
                <h3 className="text-base font-bold text-[#0B1F3A]">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Pricing Preview */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1F3A] text-balance">
                Transparent Monthly Engagement Tiers
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Indicative starting packages. Final quotes are tailored to entity count, software,
                and transaction volume.
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
                  className={`rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 bg-white ${
                    tier.highlighted
                      ? 'border-2 border-[#0B1F3A]'
                      : 'border border-slate-200'
                  }`}
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-teal-800">{tier.audience}</p>
                      <h3 className="text-xl font-bold text-[#0B1F3A] mt-1">{tier.name}</h3>
                    </div>

                    <div className="flex items-baseline gap-1.5 pb-4 border-b border-slate-100">
                      <span className="text-xs text-slate-500">From</span>
                      <span className="text-3xl font-bold text-[#0B1F3A] font-mono tabular-nums">
                        {symbol}
                        {amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">{tier.volumeLimit}</p>
                      <p>{tier.turnaround}</p>
                    </div>

                    <ul className="space-y-2.5 pt-2">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm text-slate-700">
                          <Check
                            className="h-4 w-4 text-teal-700 mt-0.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{feat}</span>
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
                        ? 'bg-[#0B1F3A] text-white hover:bg-[#132F54]'
                        : 'bg-slate-100 text-[#0B1F3A] hover:bg-slate-200'
                    }`}
                  >
                    Request a Quote
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Testimonials Placeholder */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1F3A]">
              Client &amp; Practice Partner Perspectives
            </h2>
            <p className="text-sm text-slate-600">
              Verified client endorsements will be published here as engagements complete.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIAL_PLACEHOLDERS.map((item, idx) => (
              <blockquote
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-5"
              >
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{item.quote}</p>
                <footer className="pt-4 border-t border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold text-[#0B1F3A]">{item.author}</span>
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

      {/* 7. FAQ Preview */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1F3A]">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Straight answers on GDPR data protection, ACCA quality oversight, supported cloud
                ledgers, and onboarding speed.
              </p>
              <Link
                to="/faq"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-900 pt-1"
              >
                Read all FAQs
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="lg:col-span-8 space-y-3">
              {FAQ_ITEMS.slice(0, 4).map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={faq.question}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors min-h-[52px]"
                    >
                      <span className="text-sm sm:text-base font-semibold text-[#0B1F3A]">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-500 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {faq.answer}
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
              Ready for review-ready books every month?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Schedule a 15-minute scope call or request a tailored fixed-fee quote for your UK,
              European, or Gulf entity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/contact?intent=call"
              onClick={() => void trackEvent('cta_click', { label: 'footer_cta_book_call' })}
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#0B1F3A] bg-teal-300 hover:bg-teal-200 rounded-lg transition-colors min-h-[44px] whitespace-nowrap shrink-0"
            >
              Book a Free 15-Minute Call
            </Link>
            <Link
              to="/contact"
              onClick={() => void trackEvent('cta_click', { label: 'footer_cta_get_quote' })}
              className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-white border border-slate-500 hover:bg-slate-800 rounded-lg transition-colors min-h-[44px] whitespace-nowrap shrink-0"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
