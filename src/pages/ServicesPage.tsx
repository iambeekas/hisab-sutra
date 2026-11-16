import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { SERVICES } from '../data/siteData';
import { trackEvent } from '../lib/analytics';
import { SeoHead } from '../components/SeoHead';

import { useI18n } from '../i18n/I18nContext';
import { renderTemplate } from '../i18n/template';
export function ServicesPage() {
  const { t } = useI18n();
  return (
    <>
      <SeoHead
        title={t("Accounting, Bookkeeping & Data Entry Services – Hisab Sutra")}
        description={t("Explore Hisab Sutra's outsourced accounting, bookkeeping, and financial data entry services on Xero, QuickBooks, Sage, Zoho Books, and Excel.")}
        canonicalPath="/services"
      />

      <section className="bg-surface border-b border-line-200 py-14 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-4">
          <p className="text-xs font-semibold text-accent-800">{t("Outsourced Finance Operations")}</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy-900 max-w-3xl text-balance">
            {t("Dedicated Accounting, Bookkeeping & Data Entry")}
          </h1>
          <p className="text-base sm:text-lg text-ink-600 max-w-2xl leading-relaxed">
            {t("Every engagement follows a documented four-stage workflow inside your cloud ledger, supervised by ACCA-qualified reviewers in Kathmandu.")}
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-paper-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
          {SERVICES.map((service) => (
            <article
              key={service.id}
              id={service.id}
              className="card p-6 sm:p-10 space-y-8 scroll-mt-24"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-line-200">
                <div className="space-y-2 max-w-2xl">
                  <p className="text-xs font-mono font-semibold text-accent-700 tabular-nums">
                    {service.number}. {t("Service Specification")}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">{t(service.title)}</h2>
                  <p className="text-sm sm:text-base text-ink-600 leading-relaxed">
                    {t(service.summary)}
                  </p>
                </div>

                <div className="lg:text-end space-y-1 shrink-0">
                  <p className="text-xs text-ink-500">{t("Standard Cadence")}</p>
                  <p className="text-sm font-semibold text-navy-900">{t(service.turnaround)}</p>
                  <p className="text-xs text-ink-600 max-w-xs">{t(service.idealFor)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 4-Step Process */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-sm font-semibold text-navy-900">{t("Execution Workflow")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {service.process.map((proc, index) => (
                      <div
                        key={proc.step}
                        className="p-4 rounded-lg bg-paper-50 border border-line-200 space-y-1.5"
                      >
                        <p className="text-xs font-mono font-semibold text-accent-700 tabular-nums">
                          0{index + 1}. {t(proc.step)}
                        </p>
                        <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                          {t(proc.detail)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deliverables & Tools */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-navy-900">{t("Key Deliverables")}</h3>
                    <ul className="space-y-2">
                      {service.deliverables.map((item) => (
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

                  <div className="pt-4 border-t border-line-200 space-y-2">
                    <h3 className="text-xs font-semibold text-ink-500">{t("Supported Tools")}</h3>
                    <p className="text-sm font-medium text-navy-900">
                      {service.tools.join(' · ')}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/contact?service=${encodeURIComponent(
                        service.id === 'accounting'
                          ? 'Accounting'
                          : service.id === 'bookkeeping'
                            ? 'Bookkeeping'
                            : 'Data Entry'
                      )}`}
                      onClick={() =>
                        void trackEvent('cta_click', { label: `services_quote_${service.id}` })
                      }
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white btn-primary rounded-lg transition-colors min-h-[44px]"
                    >
                      {renderTemplate(t('Request a Quote for {service}'), {
                        service: t(service.id === 'accounting' ? 'Accounting' : service.id === 'bookkeeping' ? 'Bookkeeping' : 'Data Entry'),
                      })}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
