import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { CURRENCIES, CurrencyCode, PRICING_TIERS } from '../data/siteData';
import { trackEvent } from '../lib/analytics';
import { CurrencyToggle } from '../components/CurrencyToggle';
import { SeoHead } from '../components/SeoHead';

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
  const [currency, setCurrency] = useState<CurrencyCode>('GBP');

  useEffect(() => {
    void trackEvent('pricing_view', { page: '/pricing', label: 'pricing_page' });
  }, []);

  return (
    <>
      <SeoHead
        title="Pricing & Packages (GBP, EUR, USD) – Hisab Sutra"
        description="View Hisab Sutra's transparent outsourcing packages in GBP, EUR, and USD for bookkeeping, accounting, and dedicated practice pods."
        canonicalPath="/pricing"
      />

      <section className="bg-white border-b border-slate-200 py-14 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-semibold text-teal-800">Packages &amp; Pricing</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1F3A] text-balance">
              Predictable Monthly Outsourcing Packages
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Every business has different transaction density and reporting rules. Use these three
              example tiers to benchmark monthly investment, then request a scoped fixed-fee quote.
            </p>
          </div>
          <CurrencyToggle currency={currency} onChange={setCurrency} />
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier) => {
              const amount = tier.monthlyPrices[currency];
              const symbol = CURRENCIES[currency].symbol;
              return (
                <article
                  key={tier.id}
                  className={`bg-white rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6 ${
                    tier.highlighted ? 'border-2 border-[#0B1F3A]' : 'border border-slate-200'
                  }`}
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-teal-800">{tier.audience}</p>
                      <h2 className="text-2xl font-bold text-[#0B1F3A] mt-1">{tier.name}</h2>
                      <p className="text-sm text-slate-600 mt-2">{tier.description}</p>
                    </div>

                    <div className="flex items-baseline gap-1.5 py-4 border-y border-slate-100">
                      <span className="text-xs text-slate-500">From</span>
                      <span className="text-4xl font-bold text-[#0B1F3A] font-mono tabular-nums">
                        {symbol}
                        {amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <p className="font-semibold">{tier.volumeLimit}</p>
                      <p className="text-slate-500">{tier.turnaround}</p>
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
                    )}&tier=${encodeURIComponent(`${tier.name} (${currency})`)}`}
                    onClick={() => void trackEvent('cta_click', { label: `pricing_quote_${tier.id}` })}
                    className={`w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-lg transition-colors min-h-[44px] ${
                      tier.highlighted
                        ? 'bg-[#0B1F3A] text-white hover:bg-[#132F54]'
                        : 'bg-slate-100 text-[#0B1F3A] hover:bg-slate-200'
                    }`}
                  >
                    Request a Quote
                  </Link>
                </article>
              );
            })}
          </div>

          {/* Scope Comparison Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-[#0B1F3A]">Package Scope Matrix</h2>
              <p className="text-xs text-slate-600 mt-1">
                Concrete operational limits and SLA commitments across tiers.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="py-3.5 px-6">Deliverable / Limit</th>
                    <th className="py-3.5 px-6">Bookkeeping Essentials</th>
                    <th className="py-3.5 px-6">Growth Accounting</th>
                    <th className="py-3.5 px-6">Dedicated Practice Pod</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-6 font-medium text-[#0B1F3A]">{row.feature}</td>
                      <td className="py-3.5 px-6 text-slate-600 tabular-nums">{row.essential}</td>
                      <td className="py-3.5 px-6 text-slate-800 font-medium tabular-nums">
                        {row.growth}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 tabular-nums">{row.pod}</td>
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
