import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { openCookieSettingsModal } from '../lib/consent';
import { OperationType, auth, db, handleFirestoreError } from '../lib/firebase';
import { SeoHead } from '../components/SeoHead';

function LegalLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="py-14 sm:py-16 bg-slate-50">
      <div className="max-w-[820px] mx-auto px-4 sm:px-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 space-y-6">
          <header className="border-b border-slate-200 pb-6 space-y-2">
            <p className="text-xs font-semibold text-teal-800">
              [Legal Review Draft — Verify with Qualified Counsel]
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1F3A]">{title}</h1>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </header>
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function PrivacyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeConvCount, setActiveConvCount] = useState(0);
  const [deletingActive, setDeletingActive] = useState(false);
  const [deletedActiveDone, setDeletedActiveDone] = useState(false);

  const [reqEmail, setReqEmail] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);
  const [reqDone, setReqDone] = useState(false);
  const [reqError, setReqError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.isAnonymous) {
        try {
          const snap = await getDocs(
            query(collection(db, 'conversations'), where('visitorUid', '==', currentUser.uid))
          );
          setActiveConvCount(snap.size);
        } catch {
          setActiveConvCount(0);
        }
      } else {
        setActiveConvCount(0);
      }
    });
    return () => unsub();
  }, []);

  const handleDeleteActiveBrowserChat = async () => {
    if (!user || !user.isAnonymous) return;
    setDeletingActive(true);
    setReqError('');
    try {
      const convSnap = await getDocs(
        query(collection(db, 'conversations'), where('visitorUid', '==', user.uid))
      );
      for (const convDoc of convSnap.docs) {
        const msgsSnap = await getDocs(
          query(
            collection(db, 'conversations', convDoc.id, 'messages'),
            where('visitorUid', '==', user.uid)
          )
        );
        for (const msgDoc of msgsSnap.docs) {
          await deleteDoc(doc(db, 'conversations', convDoc.id, 'messages', msgDoc.id));
        }
        await deleteDoc(doc(db, 'conversations', convDoc.id));
      }
      try {
        window.localStorage.removeItem('hisab_sutra_active_conversation_id');
      } catch {
        // ignore
      }
      setActiveConvCount(0);
      setDeletedActiveDone(true);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, 'conversations');
      } catch {
        setReqError('Could not delete active chat automatically. Please submit the form below.');
      }
    } finally {
      setDeletingActive(false);
    }
  };

  const handleSubmitDeletionRequest = async (e: FormEvent) => {
    e.preventDefault();
    setReqError('');
    const email = reqEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
      setReqError('Please enter a valid email address.');
      return;
    }

    setSubmittingReq(true);
    const requestId = `del_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    try {
      await setDoc(doc(db, 'deletionRequests', requestId), {
        email,
        visitorUid: user?.uid || '',
        reason: reqReason.trim().slice(0, 500),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setReqDone(true);
      setReqEmail('');
      setReqReason('');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, `deletionRequests/${requestId}`);
      } catch {
        setReqError('Unable to submit deletion request right now. Please email us directly.');
      }
    } finally {
      setSubmittingReq(false);
    }
  };

  return (
    <>
      <SeoHead
        title="Privacy Policy – Hisab Sutra"
        description="Privacy Policy outlining how Hisab Sutra collects, retains, and deletes inquiry and live chat data."
        canonicalPath="/privacy"
      />
      <LegalLayout
        title="Privacy Policy"
        subtitle="Last updated: [Date Placeholder] · Data Controller: Hisab Sutra ([Registered Legal Entity Name Placeholder])"
      >
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B1F3A]">1. Who We Are</h2>
          <p>
            Hisab Sutra (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is an accounting,
            bookkeeping, and financial data entry outsourcing firm located in [Kathmandu, Nepal
            Office Address Placeholder]. Contact our privacy lead at [privacy@hisabsutra.com
            Placeholder].
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B1F3A]">2. Personal Data We Collect</h2>
          <p>
            When you submit our quote form, start a live chat, or request a meeting, we collect
            your name, email address, inquiry details, and first-party session attribution
            parameters (UTM tags and referrer). Optional website analytics data is collected only
            after you explicitly accept analytics cookies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B1F3A]">
            3. Lawful Basis &amp; EU/UK Database Residency
          </h2>
          <p>
            Under UK GDPR and EU GDPR, we process inquiry and chat data on the basis of your
            consent and pre-contractual steps taken at your request. Our Firestore database is
            provisioned in an EU/UK region. We do not store client accounting documents on this
            website—supporting files are transmitted directly by email only. [Insert International
            Data Transfer / Standard Contractual Clauses wording reviewed by your legal counsel.]
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B1F3A]">4. Data Retention Schedule</h2>
          <p>
            We retain personal data only as long as necessary for the purpose collected:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Live Chat Conversations &amp; Messages:</strong> Retained for [e.g. 12 months
              Placeholder] after the conversation closes, or deleted immediately upon your request.
            </li>
            <li>
              <strong>Meeting Requests &amp; Quote Inquiries:</strong> Retained for [e.g. 24 months
              Placeholder] unless you become an active client or request earlier erasure.
            </li>
            <li>
              <strong>Consented Analytics Events:</strong> Stored with an anonymous visitor ID for
              [e.g. 12 months Placeholder].
            </li>
          </ul>
        </section>

        <section className="space-y-4 pt-4 border-t border-slate-200" id="delete-chat-data">
          <h2 className="text-base font-bold text-[#0B1F3A]">5. Delete My Chat Data</h2>
          <p>
            You may erase your active browser chat history immediately below or submit a formal
            deletion request for any past chat associated with your email address.
          </p>

          {activeConvCount > 0 && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-700">
                <p className="font-semibold text-[#0B1F3A]">
                  Active chat session found in this browser ({activeConvCount})
                </p>
                <p>Click to permanently erase your conversation and messages now.</p>
              </div>
              <button
                type="button"
                disabled={deletingActive}
                onClick={() => void handleDeleteActiveBrowserChat()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg min-h-[38px] whitespace-nowrap shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                {deletingActive ? 'Deleting...' : 'Delete My Active Chat'}
              </button>
            </div>
          )}

          {deletedActiveDone && (
            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" aria-hidden="true" />
              <span>Your active browser chat data has been permanently deleted.</span>
            </div>
          )}

          {reqDone ? (
            <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" aria-hidden="true" />
              <span>
                Your chat data deletion request has been logged. Our team will verify and purge any
                matching records within [e.g. 72 hours / 30 days Placeholder].
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmitDeletionRequest}
              className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3"
            >
              <p className="text-xs font-semibold text-[#0B1F3A]">
                Request Chat Data Deletion by Email
              </p>
              {reqError && <p className="text-xs text-red-700">{reqError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  required
                  maxLength={160}
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  placeholder="Email used in live chat *"
                  className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                />
                <input
                  type="text"
                  maxLength={500}
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="Optional note (e.g. approximate date)"
                  className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReq}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0B1F3A] hover:bg-[#132F54] rounded-lg min-h-[38px]"
              >
                {submittingReq ? 'Submitting...' : 'Submit Deletion Request'}
              </button>
            </form>
          )}
        </section>
      </LegalLayout>
    </>
  );
}

export function TermsPage() {
  return (
    <>
      <SeoHead
        title="Terms of Service – Hisab Sutra"
        description="Terms of Service governing website use and engagement agreements with Hisab Sutra."
        canonicalPath="/terms"
      />
      <LegalLayout
        title="Terms of Service"
        subtitle="Last updated: [Date Placeholder] · Hisab Sutra ([Registered Legal Entity Name Placeholder])"
      >
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B1F3A]">1. Website Scope</h2>
          <p>
            This website provides general information regarding accounting, bookkeeping, and data
            entry outsourcing services offered by Hisab Sutra. Nothing on this website constitutes
            statutory audit sign-off, legal advice, or regulated tax representation unless
            separately contracted in writing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B1F3A]">2. Indicative Pricing &amp; Quotes</h2>
          <p>
            Package rates displayed in GBP, EUR, or USD are indicative starting tiers. All formal
            engagements require a signed Master Services Agreement, Engagement Letter, and Mutual
            NDA specifying exact deliverables, turnaround SLAs, and fee schedules.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B1F3A]">3. Confidentiality &amp; Access</h2>
          <p>
            Clients retain full ownership of their accounting records and cloud ledger
            subscriptions. Hisab Sutra personnel operate strictly within role-based permissions
            authorized by the client.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B1F3A]">4. Governing Law</h2>
          <p>
            [Insert Governing Law and Dispute Resolution Jurisdiction Clause as advised by your
            commercial lawyer.]
          </p>
        </section>
      </LegalLayout>
    </>
  );
}

export function CookiesPage() {
  return (
    <>
      <SeoHead
        title="Cookie Policy – Hisab Sutra"
        description="Information about strictly necessary session storage and optional consent-gated analytics used on Hisab Sutra."
        canonicalPath="/cookies"
      />
      <LegalLayout
        title="Cookie Policy"
        subtitle="Last updated: [Date Placeholder] · Consent-First Tracking Architecture"
      >
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B1F3A]">1. How We Use Storage &amp; Cookies</h2>
          <p>
            Hisab Sutra minimizes tracking technologies. Strictly necessary browser storage is used
            to remember your cookie consent choice and preserve first-party campaign attribution
            parameters during your active browsing session.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B1F3A]">
            2. Consent-Gated Analytics Events
          </h2>
          <p>
            Analytics event logging (page views, pricing page visits, CTA clicks, and form
            conversion events) is completely disabled by default. It activates only after you click
            &ldquo;Accept all&rdquo; or enable Analytics inside Cookie Settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#0B1F3A]">3. Manage Your Preferences</h2>
          <p>You can update or withdraw your analytics consent at any time:</p>
          <button
            type="button"
            onClick={openCookieSettingsModal}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#0B1F3A] hover:bg-[#132F54] rounded-lg transition-colors min-h-[40px]"
          >
            Open Cookie Settings
          </button>
        </section>
      </LegalLayout>
    </>
  );
}
