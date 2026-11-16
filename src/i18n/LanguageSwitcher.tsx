import { Globe } from 'lucide-react';
import { LANGUAGES, useI18n, type Lang } from './I18nContext';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">{t('Language')}</span>
      <Globe
        className="pointer-events-none absolute start-2.5 h-4 w-4 text-ink-600"
        aria-hidden="true"
      />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="h-10 appearance-none rounded-lg border border-line-300 bg-surface ps-8 pe-3 text-sm font-medium text-ink-800 hover:border-navy-900 focus-visible:outline-2 focus-visible:outline-accent-700"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
