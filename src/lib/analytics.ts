import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { hasAnalyticsConsent } from './consent';
import { db, handleFirestoreError, OperationType } from './firebase';
import { getStoredAttribution } from './utm';

export type AnalyticsEventType =
  | 'page_view'
  | 'cta_click'
  | 'form_start'
  | 'form_submit'
  | 'pricing_view';

const VISITOR_ID_KEY = 'hisab_sutra_anon_visitor_id';

function generateAlphanumericId(prefix: string): string {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix}_${randomPart}`.slice(0, 64);
}

function getAnonymousVisitorId(): string {
  if (typeof window === 'undefined') return 'anon_server';
  try {
    const existing = window.localStorage.getItem(VISITOR_ID_KEY);
    if (existing && /^[a-zA-Z0-9_-]{8,64}$/.test(existing)) {
      return existing;
    }
    const created = generateAlphanumericId('hs');
    window.localStorage.setItem(VISITOR_ID_KEY, created);
    return created;
  } catch {
    return generateAlphanumericId('hs');
  }
}

/**
 * Consent-gated event tracker limited to high-signal events (page_view, cta_click,
 * form_start, form_submit, pricing_view) to stay well within Firebase Spark quotas.
 */
export async function trackEvent(
  eventType: AnalyticsEventType,
  options: {
    page?: string;
    label?: string;
  } = {}
): Promise<void> {
  if (!hasAnalyticsConsent()) {
    return;
  }

  const page =
    (options.page || (typeof window !== 'undefined' ? window.location.pathname : '/')).slice(
      0,
      200
    ) || '/';
  const label = (options.label || '').slice(0, 200);
  const attribution = getStoredAttribution();
  const eventId = generateAlphanumericId('evt');
  const visitorId = getAnonymousVisitorId();

  const path = `events/${eventId}`;

  try {
    await setDoc(doc(db, 'events', eventId), {
      visitorId,
      eventType,
      page,
      label,
      utmSource: attribution.utmSource.slice(0, 120),
      utmMedium: attribution.utmMedium.slice(0, 120),
      utmCampaign: attribution.utmCampaign.slice(0, 120),
      referrer: attribution.referrer.slice(0, 500),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.CREATE, path);
    } catch {
      // Swallowed intentionally after diagnostic log so analytics never breaks UX
    }
  }
}
