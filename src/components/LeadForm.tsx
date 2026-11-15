import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, ShieldAlert } from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, isAppCheckConfigured, OperationType } from '../lib/firebase';
import { notifyLeadViaAppsScript } from '../lib/appsScript';
import { getStoredAttribution } from '../lib/utm';
import { trackEvent } from '../lib/analytics';

interface LeadFormProps {
  defaultService?: string;
  defaultTierNote?: string;
}

const COUNTRIES = ['UK', 'Europe', 'Gulf', 'Other'] as const;
const SERVICES_OPTIONS = [
  'Accounting',
  'Bookkeeping',
  'Data Entry',
  'Full Finance Pod',
  'Other',
] as const;
const VOLUMES = [
  'Under 100 transactions',
  '100 - 500 transactions',
  '500 - 2,000 transactions',
  '2,000+ transactions',
] as const;

export function LeadForm({ defaultService = 'Bookkeeping', defaultTierNote = '' }: LeadFormProps) {
  const [name, setName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState<(typeof COUNTRIES)[number]>('UK');
  const [serviceNeeded, setServiceNeeded] = useState<(typeof SERVICES_OPTIONS)[number]>(
    SERVICES_OPTIONS.includes(defaultService as (typeof SERVICES_OPTIONS)[number])
      ? (defaultService as (typeof SERVICES_OPTIONS)[number])
      : 'Bookkeeping'
  );
  const [monthlyVolume, setMonthlyVolume] = useState<(typeof VOLUMES)[number]>(
    '100 - 500 transactions'
  );
  const [message, setMessage] = useState(
    defaultTierNote ? `Interested in package: ${defaultTierNote}. ` : ''
  );
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Spam protection: honeypot field (must remain empty) + simple human check fallback
  const [honeypot, setHoneypot] = useState('');
  const [humanAnswer, setHumanAnswer] = useState('');
  const [challenge] = useState(() => {
    const a = 3 + Math.floor(Math.random() * 5);
    const b = 2 + Math.floor(Math.random() * 4);
    return { a, b, sum: a + b };
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (
      defaultService &&
      SERVICES_OPTIONS.includes(defaultService as (typeof SERVICES_OPTIONS)[number])
    ) {
      setServiceNeeded(defaultService as (typeof SERVICES_OPTIONS)[number]);
    }
  }, [defaultService]);

  const markFormStart = () => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      void trackEvent('form_start', { label: 'lead_quote_form' });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Silent honeypot trap
    if (honeypot.trim().length > 0) {
      setSubmittedId('submitted');
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = workEmail.trim();
    const trimmedCompany = company.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2 || trimmedName.length > 120) {
      setErrorMsg('Please enter your full name (2–120 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 160) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }
    if (trimmedCompany.length < 1 || trimmedCompany.length > 160) {
      setErrorMsg('Please enter your company or practice name.');
      return;
    }
    if (trimmedMessage.length > 2000) {
      setErrorMsg('Message cannot exceed 2,000 characters.');
      return;
    }
    if (!consentAccepted) {
      setErrorMsg('Please accept the privacy consent checkbox before submitting.');
      return;
    }
    if (!isAppCheckConfigured && Number(humanAnswer.trim()) !== challenge.sum) {
      setErrorMsg(`Please answer the anti-spam check (${challenge.a} + ${challenge.b}).`);
      return;
    }

    setSubmitting(true);
    const attribution = getStoredAttribution();
    const randomPart =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
        : Math.random().toString(36).slice(2, 14);
    const leadId = `lead_${Date.now()}_${randomPart}`;
    const path = `leads/${leadId}`;

    try {
      await setDoc(doc(db, 'leads', leadId), {
        name: trimmedName,
        workEmail: trimmedEmail,
        company: trimmedCompany,
        country,
        serviceNeeded,
        monthlyVolume,
        message: trimmedMessage,
        consentAccepted: true,
        status: 'new',
        utmSource: attribution.utmSource.slice(0, 120),
        utmMedium: attribution.utmMedium.slice(0, 120),
        utmCampaign: attribution.utmCampaign.slice(0, 120),
        referrer: attribution.referrer.slice(0, 500),
        landingPage: attribution.landingPage.slice(0, 300),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      void notifyLeadViaAppsScript({
        leadId,
        name: trimmedName,
        workEmail: trimmedEmail,
        company: trimmedCompany,
        country,
        serviceNeeded,
        monthlyVolume,
        message: trimmedMessage,
        consentAccepted: true,
        utmSource: attribution.utmSource.slice(0, 120),
        utmMedium: attribution.utmMedium.slice(0, 120),
        utmCampaign: attribution.utmCampaign.slice(0, 120),
        referrer: attribution.referrer.slice(0, 500),
        landingPage: attribution.landingPage.slice(0, 300),
        companyWebsite: honeypot,
      });

      void trackEvent('form_submit', { label: serviceNeeded });
      setSubmittedId(leadId);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, path);
      } catch {
        setErrorMsg(
          'Unable to submit your request right now. Please verify your connection and try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="card p-6 sm:p-8 space-y-4">
        <div className="inline-flex items-center justify-center h-11 w-11 rounded-lg bg-teal-50 text-teal-700">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-[#0B1F3A]">Quote Request Received</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Thank you, <span className="font-semibold text-slate-900">{name}</span>. Your inquiry for{' '}
          <span className="font-semibold text-slate-900">{serviceNeeded}</span> has been securely
          recorded and an automatic confirmation email has been queued to{' '}
          <span className="font-medium text-slate-900">{workEmail}</span>.
        </p>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono tabular-nums">
          Reference: {submittedId}
        </div>
        <p className="text-xs text-slate-500">
          An ACCA engagement lead will reply within one business day. Please send any supporting
          documents directly by email—do not share files via public web forms.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmittedId(null);
            setMessage('');
            setHumanAnswer('');
          }}
          className="text-sm font-medium text-teal-700 hover:text-teal-800 underline underline-offset-4"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocus={markFormStart}
      noValidate
      className="card p-6 sm:p-8 space-y-5"
    >
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-[#0B1F3A]">Request a Tailored Quote</h3>
        <p className="text-sm text-slate-600">
          Share your ledger software and monthly volume. We respond within one business day.
        </p>
      </div>

      {/* Honeypot field hidden from human users */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="companyWebsite">Company Website</label>
        <input
          id="companyWebsite"
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800"
        >
          <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-red-600" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lead-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Full Name *
          </label>
          <input
            id="lead-name"
            type="text"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah Jenkins"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
          />
        </div>

        <div>
          <label htmlFor="lead-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Work Email *
          </label>
          <input
            id="lead-email"
            type="email"
            required
            maxLength={160}
            value={workEmail}
            onChange={(e) => setWorkEmail(e.target.value)}
            placeholder="name@company.co.uk"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="lead-company"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Company / Practice Name *
          </label>
          <input
            id="lead-company"
            type="text"
            required
            maxLength={160}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Northbridge Advisory Ltd"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
          />
        </div>

        <div>
          <label
            htmlFor="lead-country"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Region / Country *
          </label>
          <select
            id="lead-country"
            value={country}
            onChange={(e) => setCountry(e.target.value as (typeof COUNTRIES)[number])}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="lead-service"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Service Needed *
          </label>
          <select
            id="lead-service"
            value={serviceNeeded}
            onChange={(e) => setServiceNeeded(e.target.value as (typeof SERVICES_OPTIONS)[number])}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
          >
            {SERVICES_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="lead-volume" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Monthly Volume Estimate *
          </label>
          <select
            id="lead-volume"
            value={monthlyVolume}
            onChange={(e) => setMonthlyVolume(e.target.value as (typeof VOLUMES)[number])}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
          >
            {VOLUMES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="lead-message" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Software Stack &amp; Scope Notes
        </label>
        <textarea
          id="lead-message"
          rows={4}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us which software you use (Xero, QuickBooks, Sage, Zoho Books, Excel), number of entities, and desired start date."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
        />
      </div>

      {!isAppCheckConfigured && (
        <div className="max-w-xs">
          <label
            htmlFor="lead-human-check"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Spam Verification: What is {challenge.a} + {challenge.b}? *
          </label>
          <input
            id="lead-human-check"
            type="text"
            inputMode="numeric"
            required
            maxLength={4}
            value={humanAnswer}
            onChange={(e) => setHumanAnswer(e.target.value)}
            placeholder="Enter sum"
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 tabular-nums"
          />
        </div>
      )}

      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 leading-relaxed">
        <input
          type="checkbox"
          checked={consentAccepted}
          onChange={(e) => setConsentAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700 shrink-0"
        />
        <span>
          I consent to Hisab Sutra processing this inquiry and contacting me regarding accounting
          outsourcing services, stored securely in accordance with our{' '}
          <Link to="/privacy" className="text-teal-700 underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 text-sm font-semibold text-white btn-primary disabled:opacity-60 rounded-lg transition-colors min-h-[44px] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          {submitting ? 'Submitting Request...' : 'Request a Quote'}
        </button>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Lock className="h-3.5 w-3.5 text-teal-700 shrink-0" aria-hidden="true" />
          <span>Protected by honeypot &amp; encrypted EU/UK database storage</span>
        </div>
      </div>
    </form>
  );
}
