import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'ar' | 'ne';

export const LANGUAGES: { code: Lang; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'ne', label: 'नेपाली', dir: 'ltr' },
];

type Dict = Record<string, string>;

const STORAGE_KEY = 'hs-lang';

const loaders: Record<Exclude<Lang, 'en'>, () => Promise<{ default: Dict }>> = {
  ar: () => import('./dict/ar'),
  ne: () => import('./dict/ne'),
};

function isLang(value: string | null | undefined): value is Lang {
  return value === 'en' || value === 'ar' || value === 'ne';
}

function initialLang(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (isLang(fromUrl)) return fromUrl;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    /* ignore: storage or URL not available */
  }
  return 'en';
}

interface I18nContextValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (lang: Lang) => void;
  /** Translate an English source string. Falls back to the English text when no translation exists. */
  t: (text: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  dir: 'ltr',
  setLang: () => {},
  t: (text) => text,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [dict, setDict] = useState<Dict | null>(null);

  const dir = LANGUAGES.find((l) => l.code === lang)?.dir ?? 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  useEffect(() => {
    let cancelled = false;
    if (lang === 'en') {
      setDict(null);
      return;
    }
    loaders[lang]().then((mod) => {
      if (!cancelled) setDict(mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* the choice still applies for this visit */
    }
  }, []);

  const t = useCallback((text: string) => (dict && dict[text]) || text, [dict]);

  const value = useMemo(() => ({ lang, dir, setLang, t }), [lang, dir, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
