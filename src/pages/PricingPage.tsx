import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { CURRENCIES, CurrencyCode, PRICING_TIERS } from '../data/siteData';
import { trackEvent } from '../lib/analytics';
import { CurrencyToggle } from '../components/CurrencyToggle';
import { SeoHead } from '../components/SeoHead';

import { useI18n } from '../i18n/I18nContext';
const COMPARISON_ROWS = [
  {
    feature: 'Monthly Transaction Allowance',
    essential: 'Up to 150 / mo',
    growth: 'Up to 600 / mo',
    pod: '2,000+ / mo (custom)',
  },
  {
    feature: 'Reconciliation Cadence',
    essential: 'Weekly',
    growth: 'Twice-weekly',
    pod: 'Daily',
  },
  {
    feature: 'Monthly P&L & Balance Sheet Pack',
    essential: 'Trial balance check',
    growth: 'Full close by Day 7',
    pod: 'Multi-entity by Day 5',
  },
  {
    feature: 'VAT / Tax Workpapers',
    essential: 'Ledger coding ready',
    growth: 'Included',
    pod: 'Included + firm templates',
  },
  {
    feature: 'ACCA Manager Review',
    essential: 'Monthly oversight',
    growth: 'Dedicated monthly review',
    pod: 'Embedded ACCA reviewer',
  },
  {
    feature: 'Supported Software',
    essential: 'Xero, QBO, Sage, Zoho',
    growth: 'Xero, QBO, Sage, Zoho',
    pod: 'Full stack + Excel models',
  },
];

export function PricingPage() {
  const { t } = useI18n();
  const [currency, setCurrency] = useState<CurrencyCode>('GBP');

  useEffect(() => {
    void trackEvent('pricing_view', { page: '/pricing', label: 'pricing_page' });
  }, []);

  return (
    <>
      <SeoHead
        title={t("Pricing & Packages (GBP, EUR, USD) – Hisab Sutra")}
        description={t("View Hisab Sutra's transparent outsourcing packages in GBP, EUR, and USD for bookkeeping, accounting, and dedicated practice pods.")}
        canonicalPath="/pricing"
      />

      <section className="bg-surface border-b border-line-200 py-14 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold text-accent-800">{t("Packages & Pricing")}</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy-900 text-balance">
              {t("Predictable Monthly Outsourcing Packages")}
            </h1>
            <p className="text-base text-ink-600 leading-relaxed">
              {t("Every business has different transaction density and reporting rules. Use these three example tiers to benchmark monthly investment, then request a scoped fixed-fee quote.")}
            </p>
          </div>
          <CurrencyToggle currency={currency} onChange={setCurrency} />
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-paper-50 border-b border-line-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier) => {
              const amount = tier.monthlyPrices[currency];
              const symbol = CURRENCIES[currency].symbol;
              return (
                <article
                  key={tier.id}
                  className={`bg-surface rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6 ${
                    tier.highlighted ? 'border-2 border-navy-900' : 'border border-line-200'
                  }`}
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-accent-800">{t(tier.audience)}</p>
                      <h2 className="text-2xl font-bold text-navy-900 mt-1">{t(tier.name)}</h2>
                      <p className="text-sm text-ink-600 mt-2">{t(tier.description)}</p>
                    </div>

                    <div className="flex items-baseline gap-1.5 py-4 border-y border-line-100">
                      <span className="text-xs text-ink-500">{t("From")}</span>
                      <span className="text-4xl font-bold text-navy-900 font-mono tabular-nums">
                        {symbol}
                        {amount.toLocaleString('en-GB')}
                      </span>
                      <span className="text-xs text-ink-500">{t("/ month")}</span>
                    </div>

                    <div className="text-xs text-ink-700 space-y-1">
                      <p className="font-semibold">{t(tier.volumeLimit)}</p>
                      <p className="text-ink-500">{t(tier.turnaround)}</p>
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
                    )}&tier=${encodeURIComponent(`${t(tier.name)} (${currency})`)}`}
                    onClick={() => void trackEvent('cta_click', { label: `pricing_quote_${tier.id}` })}
                    className={`w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-lg transition-colors min-h-[44px] ${
                      tier.highlighted
                        ? 'btn-primary'
                        : 'bg-paper-100 text-navy-900 hover:bg-paper-200'
                    }`}
                  >
                    {t("Request a Quote")}
                  </Link>
                </article>
              );
            })}
          </div>

          {/* Scope Comparison Matrix */}
          <div className="card overflow-hidden">
            <div className="px-6 py-5 border-b border-line-200">
              <h2 className="text-lg font-bold text-navy-900">{t("Package Scope Matrix")}</h2>
              <p className="text-xs text-ink-600 mt-1">
                {t("Concrete operational limits and SLA commitments across tiers.")}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line-200 bg-paper-50 text-xs font-semibold text-ink-600">
                    <th className="py-3.5 px-6">{t("Deliverable / Limit")}</th>
                    <th className="py-3.5 px-6">{t("Bookkeeping Essentials")}</th>
                    <th className="py-3.5 px-6">{t("Growth Accounting")}</th>
                    <th className="py-3.5 px-6">{t("Dedicated Practice Pod")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-200">
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={t(row.feature)} className="hover:bg-paper-50/70">
                      <td className="py-3.5 px-6 font-medium text-navy-900">{t(row.feature)}</td>
                      <td className="py-3.5 px-6 text-ink-600 tabular-nums">{t(row.essential)}</td>
                      <td className="py-3.5 px-6 text-ink-800 font-medium tabular-nums">
                        {t(row.growth)}
                      </td>
                      <td className="py-3.5 px-6 text-ink-600 tabular-nums">{t(row.pod)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
