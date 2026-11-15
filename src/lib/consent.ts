export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
  decided: boolean;
  updatedAt: string;
}

const CONSENT_STORAGE_KEY = 'hisab_sutra_cookie_consent_v1';

const DEFAULT_PREFERENCES: ConsentPreferences = {
  necessary: true,
  analytics: false,
  decided: false,
  updatedAt: '',
};

type ConsentListener = (prefs: ConsentPreferences) => void;
const listeners = new Set<ConsentListener>();
const modalListeners = new Set<() => void>();

export function getConsentPreferences(): ConsentPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      decided: Boolean(parsed.decided),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveConsentPreferences(analytics: boolean): ConsentPreferences {
  const next: ConsentPreferences = {
    necessary: true,
    analytics,
    decided: true,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota issues
    }
  }

  listeners.forEach((cb) => cb(next));
  return next;
}

export function hasAnalyticsConsent(): boolean {
  const prefs = getConsentPreferences();
  return prefs.decided && prefs.analytics;
}

export function subscribeConsent(listener: ConsentListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function openCookieSettingsModal(): void {
  modalListeners.forEach((cb) => cb());
}

export function subscribeOpenCookieSettings(listener: () => void): () => void {
  modalListeners.add(listener);
  return () => {
    modalListeners.delete(listener);
  };
}
