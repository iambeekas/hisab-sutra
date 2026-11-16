import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SITE_IMAGES, TEAM_MEMBERS, TIMEZONE_OVERLAP } from '../data/siteData';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { IllustrativeBadge } from '../components/IllustrativeBadge';
import { SeoHead } from '../components/SeoHead';

import { useI18n } from '../i18n/I18nContext';
const isPlaceholder = (value: string) => value.trim().startsWith('[');

export function AboutPage() {
  const { t } = useI18n();
  return (
    <>
      <SeoHead
        title={t("About Hisab Sutra – ACCA Team & Nepal Advantage")}
        description={t("Meet the ACCA-led team behind Hisab Sutra in Kathmandu, Nepal, and learn how our cost efficiency and time-zone overlap serve UK, Europe, and Gulf clients.")}
        canonicalPath="/about"
      />

      {/* Intro */}
      <section className="bg-surface border-b border-line-200 py-14 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs font-semibold text-accent-800">{t("About Hisab Sutra")}</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy-900 text-balance">
              {t("Formula for Next Generational Books")}
            </h1>
            <p className="text-base text-ink-600 leading-relaxed">
              {t("Hisab Sutra is an accounting outsourcing practice headquartered in Kathmandu, Nepal. We pair disciplined bookkeeping execution with ACCA-qualified review standards so businesses and accounting firms across the UK, Europe, and the Gulf get dependable, audit-ready ledgers without inflated local overhead.")}
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white btn-primary rounded-lg transition-colors min-h-[44px]"
              >
                {t("Schedule an Introduction Call")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-ink-900/10 shadow-[0_22px_44px_-20px_rgb(11_31_58/0.32)] aspect-[16/9]">
              <ImageWithFallback
                src={SITE_IMAGES.kathmanduOffice}
                alt={t("Illustration of a Kathmandu accounting workspace overlooking Himalayan foothills")}
                width={1200}
                height={670}
                className="w-full h-full object-cover"
              />
              <IllustrativeBadge />
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Honest ACCA Credentials */}
      <section className="py-14 sm:py-16 bg-paper-50 border-b border-line-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">
              {t("Leadership & ACCA Credentials")}
            </h2>
            <p className="text-sm sm:text-base text-ink-600">
              {t("Engagements are led by ACCA-qualified professionals. Named profiles and membership details are published here once verified.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <article
                key={member.role}
                className="card p-6 flex flex-col sm:flex-row gap-5 items-start"
              >
                <div className="shrink-0">
                  <div className="w-24 h-24 rounded-xl overflow-hidden ring-1 ring-ink-900/10">
                    <ImageWithFallback
                      src={member.image}
                      alt={t("Illustrative portrait")}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-1.5 text-center text-[10px] font-medium text-ink-500">
                    {t("Illustrative portrait")}
                  </p>
                </div>
                <div className="space-y-2">
                  <div>
                    <h3 className="text-lg font-bold text-navy-900">
                      {t(isPlaceholder(member.name) ? member.role : member.name)}
                    </h3>
                    {!isPlaceholder(member.name) && (
                      <p className="text-sm font-medium text-accent-800">{t(member.role)}</p>
                    )}
                    {!isPlaceholder(member.credential) && (
                      <p className="text-xs font-mono text-ink-500 mt-0.5">{member.credential}</p>
                    )}
                  </div>
                  {!isPlaceholder(member.bio) && (
                    <p className="text-sm text-ink-600 leading-relaxed">{member.bio}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Nepal & Time-Zone Overlap */}
      <section className="py-14 sm:py-16 bg-surface">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 space-y-2">
              <CheckCircle2 className="h-5 w-5 text-accent-700" aria-hidden="true" />
              <h3 className="text-lg font-bold text-navy-900">{t("Sustainable Cost Advantage")}</h3>
              <p className="text-sm text-ink-600 leading-relaxed">
                {t("Operating from Kathmandu enables dedicated accounting capacity at substantially lower total cost than domestic UK, European, or GCC hiring—without compromising IFRS or ACCA rigor.")}
              </p>
            </div>
            <div className="card p-6 space-y-2">
              <CheckCircle2 className="h-5 w-5 text-accent-700" aria-hidden="true" />
              <h3 className="text-lg font-bold text-navy-900">{t("Skilled ACCA Talent Pipeline")}</h3>
              <p className="text-sm text-ink-600 leading-relaxed">
                {t("Nepal maintains a strong English-proficient community of ACCA members, affiliates, and finance graduates trained in international reporting standards and cloud ledgers.")}
              </p>
            </div>
            <div className="card p-6 space-y-2">
              <CheckCircle2 className="h-5 w-5 text-accent-700" aria-hidden="true" />
              <h3 className="text-lg font-bold text-navy-900">{t("Strategic Time-Zone Overlap")}</h3>
              <p className="text-sm text-ink-600 leading-relaxed">
                {t("Nepal Standard Time (UTC+5:45) sits right beside Gulf hours and ahead of Europe and the UK—allowing live collaboration plus overnight morning-ready reconciliations.")}
              </p>
            </div>
          </div>

          <div className="bg-paper-50 border border-line-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-line-200">
              <h2 className="text-lg font-bold text-navy-900">
                {t("Regional Working-Hour Overlap (Kathmandu NPT UTC+5:45)")}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line-200 bg-surface text-xs font-semibold text-ink-600">
                    <th className="py-3.5 px-6">{t("Client Region")}</th>
                    <th className="py-3.5 px-6">{t("Local Time Zone")}</th>
                    <th className="py-3.5 px-6">{t("Kathmandu Core Shift")}</th>
                    <th className="py-3.5 px-6">{t("Live / Overnight Advantage")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-200">
                  {TIMEZONE_OVERLAP.map((tz) => (
                    <tr key={t(tz.region)} className="bg-surface/70">
                      <td className="py-3.5 px-6 font-semibold text-navy-900">{t(tz.region)}</td>
                      <td className="py-3.5 px-6 font-mono text-xs text-ink-600 tabular-nums">
                        {tz.zone}
                      </td>
                      <td className="py-3.5 px-6 font-mono text-xs text-ink-700 tabular-nums">
                        {tz.nepalHours}
                      </td>
                      <td className="py-3.5 px-6 text-ink-600">{t(tz.clientOverlap)}</td>
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
