export type CurrencyCode = 'GBP' | 'EUR' | 'USD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  USD: { code: 'USD', symbol: '$', label: 'USD ($)' },
};

export const SITE_IMAGES = {
  heroStudio: '/src/assets/images/hero_accounting_firm_1794705727048.jpg',
  kathmanduOffice: '/src/assets/images/about_kathmandu_office_1794705726471.jpg',
  teamLeadOne: '/src/assets/images/team_acca_lead_1794705727047.jpg',
  teamLeadTwo: '/src/assets/images/team_bookkeeping_director_1794705727341.jpg',
};

export interface ServiceDetail {
  id: string;
  number: string;
  title: string;
  summary: string;
  idealFor: string;
  turnaround: string;
  process: { step: string; detail: string }[];
  deliverables: string[];
  tools: string[];
}

export const SERVICES: ServiceDetail[] = [
  {
    id: 'accounting',
    number: '01',
    title: 'Accounting & Reporting',
    summary:
      'Monthly management accounts, multi-entity consolidations, statutory year-end schedules, and VAT/tax workpapers prepared under ACCA-qualified oversight.',
    idealFor: 'UK, European, and Gulf SMEs and accounting firms needing review-ready packs.',
    turnaround: 'Monthly close within 5–7 working days',
    process: [
      {
        step: 'Trial Balance & Cut-Off Review',
        detail: 'Verify opening balances, intercompany accounts, and period-end cut-off entries.',
      },
      {
        step: 'Accruals, Prepayments & Fixed Assets',
        detail: 'Post depreciation schedules, deferred revenue journals, and payroll accruals.',
      },
      {
        step: 'VAT / Corporate Tax Workpapers',
        detail: 'Compile structured reconciliations aligned with UK HMRC, EU VAT, or GCC FTA rules.',
      },
      {
        step: 'ACCA Manager Quality Sign-Off',
        detail: 'Every reporting pack undergoes a two-tier review before delivery to your team.',
      },
    ],
    deliverables: [
      'Monthly P&L, Balance Sheet & Cash Flow Statement',
      'Fixed asset register & depreciation schedules',
      'Prepayment, accrual & deferred income schedules',
      'Year-end audit-ready lead schedules & working papers',
      'Variance commentary & aged debtor/creditor summaries',
    ],
    tools: ['Xero', 'QuickBooks Online', 'Sage 50 / Sage Intacct', 'Zoho Books', 'Microsoft Excel'],
  },
  {
    id: 'bookkeeping',
    number: '02',
    title: 'Bookkeeping & Reconciliations',
    summary:
      'Daily or weekly transaction coding, multi-currency bank and credit card reconciliations, accounts payable/receivable maintenance, and expense audit trails.',
    idealFor: 'Growing businesses and practices replacing backlog catch-up with clean weekly books.',
    turnaround: '24–48 hour turnaround on routine ledger entries',
    process: [
      {
        step: 'Secure Document Ingestion',
        detail: 'Collect supplier bills, receipts, and bank feeds directly via your cloud ledger.',
      },
      {
        step: 'Chart of Accounts Coding',
        detail: 'Categorize transactions consistently across classes, projects, and tax rates.',
      },
      {
        step: 'Multi-Currency Reconciliation',
        detail: 'Reconcile GBP, EUR, USD, AED, SAR, and QAR bank, Stripe, and Wise feeds.',
      },
      {
        step: 'Exception Query Log',
        detail: 'Flag missing receipts or unallocated items in one concise weekly query sheet.',
      },
    ],
    deliverables: [
      'Daily or weekly bank, card & payment gateway reconciliations',
      'Accounts payable bill entry & supplier statement matching',
      'Sales invoicing & aged receivable tracking',
      'Payroll journal posting & expense claim verification',
      'Clean, audit-ready audit trails inside your ledger',
    ],
    tools: ['Xero', 'QuickBooks Online', 'Sage Business Cloud', 'Zoho Books', 'Microsoft Excel'],
  },
  {
    id: 'data-entry',
    number: '03',
    title: 'Financial Data Entry & Migration',
    summary:
      'High-accuracy invoice digitization, historical catch-up processing, bank PDF-to-ledger conversion, and structured chart-of-accounts data migration.',
    idealFor: 'Practices onboarding backlogged clients or migrating legacy desktop files to cloud ledgers.',
    turnaround: 'Scoped per batch with dual-check verification',
    process: [
      {
        step: 'Schema & Template Mapping',
        detail: 'Standardize tax codes, supplier names, and invoice fields before ingestion.',
      },
      {
        step: 'Structured Data Capture',
        detail: 'Extract line-item detail from PDFs, scanned bills, and multi-tab spreadsheets.',
      },
      {
        step: 'Duplicate & Formula Validation',
        detail: 'Run automated cross-checks and manual spot audits to eliminate transposition errors.',
      },
      {
        step: 'Direct Ledger Import',
        detail: 'Upload verified CSV/XLSX batches cleanly into Xero, QuickBooks, Sage, or Zoho.',
      },
    ],
    deliverables: [
      'Line-by-line supplier invoice & receipt entry',
      'PDF bank statement extraction & reconciliation prep',
      'Historical catch-up ledger reconstruction',
      'Clean CSV / XLSX import templates for ledger migrations',
      'Customer, vendor & inventory master-list cleansing',
    ],
    tools: ['Microsoft Excel', 'Xero', 'QuickBooks', 'Sage', 'Zoho Books'],
  },
];

export interface PricingTier {
  id: string;
  name: string;
  audience: string;
  description: string;
  monthlyPrices: Record<CurrencyCode, number>;
  volumeLimit: string;
  turnaround: string;
  highlighted?: boolean;
  features: string[];
  serviceMapping: 'Data Entry' | 'Bookkeeping' | 'Accounting' | 'Full Finance Pod';
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'essential-bookkeeping',
    name: 'Bookkeeping Essentials',
    audience: 'For early-stage SMEs & sole operators',
    description: 'Reliable weekly bookkeeping and bank reconciliations with clean VAT-ready records.',
    monthlyPrices: {
      GBP: 390,
      EUR: 450,
      USD: 490,
    },
    volumeLimit: 'Up to 150 transactions / month',
    turnaround: 'Weekly reconciliation cadence',
    serviceMapping: 'Bookkeeping',
    features: [
      'Weekly bank & card reconciliations (1–2 accounts)',
      'Supplier bill & receipt coding',
      'Monthly exception query summary',
      'Xero, QuickBooks, Sage, or Zoho Books',
      'Dedicated bookkeeper + ACCA review oversight',
    ],
  },
  {
    id: 'growth-accounting',
    name: 'Growth Accounting',
    audience: 'For scaling businesses in UK, Europe & Gulf',
    description: 'End-to-end bookkeeping, monthly management accounts, and tax/VAT workpapers.',
    monthlyPrices: {
      GBP: 790,
      EUR: 920,
      USD: 990,
    },
    volumeLimit: 'Up to 600 transactions / month',
    turnaround: 'Twice-weekly updates + Day-7 close',
    highlighted: true,
    serviceMapping: 'Accounting',
    features: [
      'Twice-weekly bank, gateway & multi-currency reconciliations',
      'AP/AR ledger management & supplier matching',
      'Monthly P&L, Balance Sheet & accrual schedules',
      'VAT / Corporate Tax preparation workpapers',
      'Monthly review call with ACCA Engagement Lead',
    ],
  },
  {
    id: 'dedicated-pod',
    name: 'Dedicated Practice Pod',
    audience: 'For accounting firms & multi-entity groups',
    description: 'White-label capacity from Kathmandu integrated directly into your firm workflows.',
    monthlyPrices: {
      GBP: 1450,
      EUR: 1690,
      USD: 1850,
    },
    volumeLimit: '2,000+ transactions or multi-client allocation',
    turnaround: 'Daily execution + custom SLA',
    serviceMapping: 'Full Finance Pod',
    features: [
      'Dedicated full-time or fractional pod (Bookkeeper + ACCA Reviewer)',
      'White-label working papers matching your firm templates',
      'Multi-entity consolidations & year-end statutory prep',
      'Custom workflow integration across Xero, QuickBooks & Sage',
      'Direct overlap hours for UK, CET, and Gulf time zones',
    ],
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Discovery & Scope Assessment',
    description:
      'In a 15-minute call, we review your accounting software, transaction volume, reporting deadlines, and regional compliance requirements.',
  },
  {
    step: '02',
    title: 'Secure Access & NDA Onboarding',
    description:
      'We execute confidentiality agreements, set up role-based cloud ledger permissions (never sharing raw master passwords), and document your chart of accounts.',
  },
  {
    step: '03',
    title: 'Dedicated Execution from Nepal',
    description:
      'Your assigned bookkeeper and ACCA reviewer process entries on a daily or weekly schedule with real-time overlap during UK, EU, and Gulf business hours.',
  },
  {
    step: '04',
    title: 'Review-Ready Close & Reporting',
    description:
      'Receive clean reconciliations, structured exception logs, and monthly management packs on time every month—ready for management decisions or statutory filing.',
  },
];

export const TEAM_MEMBERS = [
  {
    name: '[Founder / Managing Partner Name]',
    role: 'Managing Director & Engagement Lead',
    credential: '[ACCA Member / Membership No. Placeholder]',
    bio: '[Placeholder: Brief bio outlining UK/IFRS reporting experience, oversight of cross-border client deliverables, and quality assurance standards in Kathmandu.]',
    image: SITE_IMAGES.teamLeadOne,
  },
  {
    name: '[Head of Bookkeeping Operations Name]',
    role: 'Director of Bookkeeping & Cloud Systems',
    credential: '[ACCA Member / Affiliate Credential Placeholder]',
    bio: '[Placeholder: Brief bio detailing cloud ledger migrations across Xero, QuickBooks, Sage, and Zoho Books, plus team training and SLA governance.]',
    image: SITE_IMAGES.teamLeadTwo,
  },
];

export const TIMEZONE_OVERLAP = [
  {
    region: 'Gulf (UAE, Qatar)',
    zone: 'GST (UTC+4)',
    nepalHours: '09:00 – 18:00 NPT',
    clientOverlap: '07:15 – 16:15 GST (Full business day overlap)',
  },
  {
    region: 'Saudi Arabia',
    zone: 'AST (UTC+3)',
    nepalHours: '09:00 – 18:00 NPT',
    clientOverlap: '06:15 – 15:15 AST (7+ hours live overlap)',
  },
  {
    region: 'Europe',
    zone: 'CET (UTC+1) / CEST (UTC+2)',
    nepalHours: '10:00 – 19:00 NPT',
    clientOverlap: '05:15 – 14:15 CET (Morning to afternoon overlap)',
  },
  {
    region: 'United Kingdom',
    zone: 'GMT (UTC+0) / BST (UTC+1)',
    nepalHours: '10:00 – 19:00 NPT',
    clientOverlap: '04:15 – 13:15 GMT (Morning close ready before your day starts)',
  },
];

export const FAQ_ITEMS = [
  {
    category: 'Credentials & Quality',
    question: 'Who prepares and reviews our accounts?',
    answer:
      'Routine bookkeeping and data entry are executed by trained accounting specialists in Kathmandu, and every monthly close and accounting workpaper is reviewed under ACCA-qualified oversight before delivery. [Insert your exact team count and ACCA membership verification details here.]',
  },
  {
    category: 'Security & GDPR',
    question: 'How do you handle data privacy, documents, and GDPR compliance?',
    answer:
      'Our application database is hosted in an EU/UK Firestore region. We do not store client financial documents on the website—clients send supporting files strictly by email to our secure inbox, and we work inside your cloud accounting platforms using least-privilege, role-based access and signed NDAs.',
  },
  {
    category: 'Software & Workflows',
    question: 'Which accounting software platforms do you support?',
    answer:
      'We work natively in Xero, QuickBooks Online, Sage (Sage 50, Sage Business Cloud, Sage Intacct), Zoho Books, and structured Microsoft Excel workbooks, alongside receipt-capture tools like Dext or Hubdoc.',
  },
  {
    category: 'Time Zones & Communication',
    question: 'How does the time-zone difference with Nepal work for UK, Europe, and Gulf clients?',
    answer:
      'Nepal Standard Time (UTC+5:45) gives Gulf clients nearly a full day of live overlap, European teams 5–6 hours of shared hours, and UK clients the advantage of overnight ledger processing—meaning your books are reconciled and waiting when your London office opens.',
  },
  {
    category: 'Pricing & Onboarding',
    question: 'Are the listed package rates fixed, and how fast can we start?',
    answer:
      'The three pricing tiers provide transparent starting benchmarks in GBP, EUR, and USD. After reviewing your transaction volume and software setup on a brief call, we issue a fixed monthly quote with no hidden fees. Standard onboarding takes 5–7 business days.',
  },
  {
    category: 'Engagement Scope',
    question: 'Do you work directly with SMEs as well as accounting practices?',
    answer:
      'Yes. We serve both direct small-to-medium businesses looking for reliable finance execution and UK/EU/Gulf accounting firms seeking white-label back-office capacity during peak tax and year-end seasons.',
  },
];

export const TESTIMONIAL_PLACEHOLDERS = [
  {
    quote:
      '[Client Testimonial Placeholder: Insert verified quote describing response times, monthly close reliability, and communication quality.]',
    author: '[Client Name Placeholder]',
    role: '[Role & Company Name, UK]',
  },
  {
    quote:
      '[Practice Partner Testimonial Placeholder: Insert verified quote from an accounting firm partner regarding white-label working papers and capacity scaling.]',
    author: '[Partner Name Placeholder]',
    role: '[Practice Title & Firm Name, UAE / Europe]',
  },
];
