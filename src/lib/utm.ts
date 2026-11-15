export interface UtmAttribution {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrer: string;
  landingPage: string;
}

const SESSION_KEY = 'hisab_sutra_first_visit_attribution';

function sanitizeString(value: string | null | undefined, maxLen: number): string {
  if (!value) return '';
  return value.trim().slice(0, maxLen);
}

/**
 * Captures UTM parameters (utm_source, utm_medium, utm_campaign), document.referrer,
 * and landingPage on the visitor's first visit in this first-party session.
 * Subsequent navigations preserve the original attribution values.
 */
export function captureInitialAttribution(): UtmAttribution {
  if (typeof window === 'undefined') {
    return {
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      referrer: '',
      landingPage: '/',
    };
  }

  try {
    const existingRaw = window.sessionStorage.getItem(SESSION_KEY);
    if (existingRaw) {
      return JSON.parse(existingRaw) as UtmAttribution;
    }

    const params = new URLSearchParams(window.location.search);
    const attribution: UtmAttribution = {
      utmSource: sanitizeString(params.get('utm_source'), 120),
      utmMedium: sanitizeString(params.get('utm_medium'), 120),
      utmCampaign: sanitizeString(params.get('utm_campaign'), 120),
      referrer: sanitizeString(document.referrer, 500),
      landingPage: sanitizeString(window.location.pathname + window.location.search, 300) || '/',
    };

    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(attribution));
    return attribution;
  } catch {
    return {
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      referrer: '',
      landingPage: '/',
    };
  }
}

export function getStoredAttribution(): UtmAttribution {
  return captureInitialAttribution();
}
