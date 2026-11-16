import { CURRENCIES, CurrencyCode } from '../data/siteData';

import { useI18n } from '../i18n/I18nContext';
interface CurrencyToggleProps {
  currency: CurrencyCode;
  onChange: (next: CurrencyCode) => void;
}

const CODES: CurrencyCode[] = ['GBP', 'EUR', 'USD'];

export function CurrencyToggle({ currency, onChange }: CurrencyToggleProps) {
  const { t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("Select display currency")}
      className="inline-flex items-center gap-1 p-1 rounded-lg bg-paper-100 border border-line-200"
    >
      {CODES.map((code) => {
        const active = currency === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            aria-pressed={active}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
              active
                ? 'bg-[#0B1F3A] text-white shadow-sm'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            {CURRENCIES[code].label}
          </button>
        );
      })}
    </div>
  );
}
