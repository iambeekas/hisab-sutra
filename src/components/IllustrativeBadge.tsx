import { Sparkles } from 'lucide-react';

/** Small overlay that labels AI-generated or stock imagery as illustrative. */
export function IllustrativeBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-medium text-ink-700 shadow-sm ring-1 ring-ink-900/10 backdrop-blur ${className}`}
    >
      <Sparkles className="h-3 w-3 text-accent-700" aria-hidden="true" />
      Illustrative image
    </span>
  );
}
