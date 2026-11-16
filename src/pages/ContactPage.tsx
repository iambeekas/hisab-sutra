import { useSearchParams } from 'react-router-dom';
import { Clock, Globe2, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { LeadForm } from '../components/LeadForm';
import { SeoHead } from '../components/SeoHead';

import { useI18n } from '../i18n/I18nContext';
export function ContactPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get('service') || 'Bookkeeping';
  const tierParam = searchParams.get('tier') || '';
  const intentParam = searchParams.get('intent') || '';

  return (
    <>
      <SeoHead
        title={t("Contact & Request a Quote – Hisab Sutra")}
        description={t("Request a tailored accounting, bookkeeping, or data entry quote from Hisab Sutra in Kathmandu, Nepal.")}
        canonicalPath="/contact"
      />

      <section className="bg-surface border-b border-line-200 py-14 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-3">
          <p className="text-xs font-semibold text-accent-800">{t("Start a Conversation")}</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy-900 text-balance">
            {intentParam === 'call'
              ? t('Book a Free 15-Minute Discovery Call')
              : t('Request a Tailored Outsourcing Quote')}
          </h1>
          <p className="text-base text-ink-600 max-w-2xl leading-relaxed">
            {t("Tell us about your accounting platform, transaction volume, and target region. Our engagement lead will reply within one business day.")}
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-paper-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="card p-6 space-y-5">
              <h2 className="text-lg font-bold text-navy-900">{t("Practice Contact Details")}</h2>

              <div className="space-y-4 text-sm text-ink-600">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-accent-700 mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-navy-900">{t("Kathmandu Delivery Office")}</p>
                    <p>{t("Kathmandu, Nepal")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-accent-700 mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-navy-900">{t("Email")}</p>
                    <a href="mailto:hisabsutra@bikasb.com.np" className="text-accent-800 hover:text-accent-900 underline underline-offset-2">
                      hisabsutra@bikasb.com.np
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-accent-700 mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-navy-900">{t("Operating Overlap")}</p>
                    <p>{t("Mon–Fri · 09:00–19:00 NPT (UTC+5:45), aligned with UK, EU & Gulf")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe2 className="h-4 w-4 text-accent-700 mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-navy-900">{t("Regions Served")}</p>
                    <p>{t("United Kingdom, European Union, UAE, Saudi Arabia, Qatar")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                <ShieldCheck className="h-4 w-4 text-accent-700 shrink-0" aria-hidden="true" />
                <span>{t("GDPR & Confidentiality Notice")}</span>
              </div>
              <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                {t("Inquiry submissions are stored in an EU/UK-region database solely to evaluate your service request and prepare a proposal. We do not store client files on the website—all documents are sent by email only after a mutual NDA is signed.")}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <LeadForm defaultService={serviceParam} defaultTierNote={tierParam} />
          </div>
        </div>
      </section>
    </>
  );
}
