import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '../data/siteData';
import { SeoHead } from '../components/SeoHead';

const CATEGORIES = ['All', ...Array.from(new Set(FAQ_ITEMS.map((item) => item.category)))];

export function FaqPage() {
  const [category, setCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered =
    category === 'All' ? FAQ_ITEMS : FAQ_ITEMS.filter((item) => item.category === category);

  return (
    <>
      <SeoHead
        title="Frequently Asked Questions – Hisab Sutra"
        description="Answers to common questions about Hisab Sutra's ACCA oversight, GDPR compliance, supported software, pricing, and onboarding."
        canonicalPath="/faq"
      />

      <section className="bg-white border-b border-slate-200 py-14 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold text-teal-800">Knowledge Base</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1F3A]">
              Frequently Asked Questions
            </h1>
            <p className="text-base text-slate-600">
              Everything UK, European, and Gulf finance leaders ask before starting an outsourced
              engagement with our Kathmandu team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  setOpenIndex(0);
                }}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  category === cat
                    ? 'bg-[#0B1F3A] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-slate-50">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 space-y-3">
          {filtered.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.question}
                className="card overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors min-h-[56px]"
                >
                  <div>
                    <span className="text-xs text-teal-800 font-medium block mb-0.5">
                      {item.category}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-[#0B1F3A]">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-3 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}

          <div className="mt-8 pt-6 text-center">
            <p className="text-sm text-slate-600 mb-3">Have a specific question about your ledger?</p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white btn-primary rounded-lg min-h-[44px]"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
