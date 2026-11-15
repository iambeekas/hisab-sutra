import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import {
  ConsentPreferences,
  getConsentPreferences,
  saveConsentPreferences,
  subscribeConsent,
  subscribeOpenCookieSettings,
} from '../lib/consent';

export function CookieBanner() {
  const [prefs, setPrefs] = useState<ConsentPreferences>(() => getConsentPreferences());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsDraft, setAnalyticsDraft] = useState(prefs.analytics);

  useEffect(() => {
    const unsubConsent = subscribeConsent((next) => {
      setPrefs(next);
      setAnalyticsDraft(next.analytics);
    });
    const unsubModal = subscribeOpenCookieSettings(() => {
      const current = getConsentPreferences();
      setAnalyticsDraft(current.analytics);
      setSettingsOpen(true);
    });
    return () => {
      unsubConsent();
      unsubModal();
    };
  }, []);

  const handleAcceptAll = () => {
    saveConsentPreferences(true);
    setSettingsOpen(false);
    void trackEvent('page_view', { label: 'consent_accepted' });
  };

  const handleRejectNonEssential = () => {
    saveConsentPreferences(false);
    setSettingsOpen(false);
  };

  const handleSaveSettings = () => {
    saveConsentPreferences(analyticsDraft);
    setSettingsOpen(false);
    if (analyticsDraft) {
      void trackEvent('page_view', { label: 'consent_custom_accepted' });
    }
  };

  if (prefs.decided && !settingsOpen) {
    return null;
  }

  return (
    <>
      {!prefs.decided && !settingsOpen && (
        <aside
          aria-label="Cookie consent banner"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-[0_-10px_30px_-12px_rgb(11_31_58/0.25)]"
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:pr-44">
            <div className="space-y-1 min-w-0 lg:flex-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3A]">
                <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0" aria-hidden="true" />
                <span>Your Privacy &amp; Cookie Preferences</span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                We use strictly necessary storage for session attribution and security. Optional
                analytics cookies help us measure page views and inquiry conversions—never loaded
                until you accept. Read our{' '}
                <Link to="/cookies" className="text-teal-700 underline underline-offset-2">
                  Cookie Policy
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAnalyticsDraft(prefs.analytics);
                  setSettingsOpen(true);
                }}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] inline-flex items-center gap-1.5"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                Settings
              </button>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3 py-2 text-xs font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
              >
                Reject non-essential
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-2 text-xs font-semibold text-white btn-primary rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
              >
                Accept all
              </button>
            </div>
          </div>
        </aside>
      )}

      {settingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="card shadow-xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="cookie-settings-title" className="text-lg font-semibold text-[#0B1F3A]">
                  Cookie &amp; Tracking Settings
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Manage consent preferences for Hisab Sutra. Changes apply immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="Close cookie settings"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 border-y border-slate-200 py-4">
              <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Strictly Necessary</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Required for form protection, consent state, and first-party session routing.
                  </p>
                </div>
                <span className="text-xs font-medium text-teal-800 shrink-0">Always active</span>
              </div>

              <label className="flex items-start justify-between gap-4 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Analytics &amp; Conversion Events</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Records anonymous page views, pricing views, CTA clicks, and form conversions in
                    our EU-hosted Firestore database.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsDraft}
                  onChange={(e) => setAnalyticsDraft(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3 py-2 text-xs font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg min-h-[40px]"
              >
                Reject non-essential
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg min-h-[40px]"
              >
                Save preferences
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-2 text-xs font-semibold text-white btn-primary rounded-lg min-h-[40px]"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
