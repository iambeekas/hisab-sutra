import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { CookieBanner } from './components/CookieBanner';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { trackEvent } from './lib/analytics';
import { captureInitialAttribution } from './lib/utm';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { HomePage } from './pages/HomePage';
import { CookiesPage, PrivacyPage, TermsPage } from './pages/LegalPages';
import { PricingPage } from './pages/PricingPage';
import { ServicesPage } from './pages/ServicesPage';

import { useI18n } from './i18n/I18nContext';
const ChatWidget = lazy(() => import('./components/ChatWidget').then((m) => ({ default: m.ChatWidget })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    captureInitialAttribution();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Skip analytics on admin route
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    void trackEvent('page_view', { page: location.pathname });
  }, [location.pathname]);

  return null;
}

function NotFoundPage() {
  const { t } = useI18n();
  useEffect(() => {
    document.title = 'Page Not Found | Hisab Sutra';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);

  return (
    <section className="py-24 bg-paper-50 text-center px-4">
      <div className="max-w-md mx-auto space-y-4">
        <p className="text-xs font-mono font-semibold text-accent-800">404</p>
        <h1 className="text-2xl font-bold text-navy-900">{t("Page Not Found")}</h1>
        <p className="text-sm text-ink-600">
          {t("The page you requested does not exist or has moved.")}
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white btn-primary rounded-lg min-h-[44px]"
        >
          {t("Return Home")}
        </Link>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <div className="min-h-screen flex flex-col bg-paper-50 text-ink-900">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route
              path="/admin"
              element={
                <Suspense fallback={null}>
                  <AdminPage />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <CookieBanner />
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      </div>
    </BrowserRouter>
  );
}
