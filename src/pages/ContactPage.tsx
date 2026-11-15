import { useSearchParams } from 'react-router-dom';
import { Clock, Globe2, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { LeadForm } from '../components/LeadForm';
import { SeoHead } from '../components/SeoHead';

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get('service') || 'Bookkeeping';
  const tierParam = searchParams.get('tier') || '';
  const intentParam = searchParams.get('intent') || '';

  return (
    <>
      <SeoHead
        title="Contact & Request a Quote – Hisab Sutra"
        description="Request a tailored accounting, bookkeeping, or data entry quote from Hisab Sutra in Kathmandu, Nepal."
        canonicalPath="/contact"
      />

      <section className="bg-white border-b border-slate-200 py-14 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-3">
          <p className="text-xs font-semibold text-teal-800">Start a Conversation</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1F3A] text-balance">
            {intentParam === 'call'
              ? 'Book a Free 15-Minute Discovery Call'
              : 'Request a Tailored Outsourcing Quote'}
          </h1>
          <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
            Tell us about your accounting platform, transaction volume, and target region. Our
            engagement lead will reply within one business day.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="card p-6 space-y-5">
              <h2 className="text-lg font-bold text-[#0B1F3A]">Practice Contact Details</h2>

              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-teal-700 mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-[#0B1F3A]">Kathmandu Delivery Office</p>
                    <p>Kathmandu, Nepal</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-teal-700 mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-[#0B1F3A]">Operating Overlap</p>
                    <p>Mon–Fri · 09:00–19:00 NPT (UTC+5:45), aligned with UK, EU &amp; Gulf</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe2 className="h-4 w-4 text-teal-700 mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-[#0B1F3A]">Regions Served</p>
                    <p>United Kingdom, European Union, UAE, Saudi Arabia, Qatar</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3A]">
                <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0" aria-hidden="true" />
                <span>GDPR &amp; Confidentiality Notice</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Inquiry submissions are stored in an EU/UK-region database solely to evaluate your
                service request and prepare a proposal. We do not store client files on the
                website—all documents are sent by email only after a mutual NDA is signed.
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
