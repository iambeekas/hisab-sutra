import { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { ChatWidget } from './components/ChatWidget';
import { CookieBanner } from './components/CookieBanner';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { trackEvent } from './lib/analytics';
import { captureInitialAttribution } from './lib/utm';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { HomePage } from './pages/HomePage';
import { CookiesPage, PrivacyPage, TermsPage } from './pages/LegalPages';
import { PricingPage } from './pages/PricingPage';
import { ServicesPage } from './pages/ServicesPage';

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
  return (
    <section className="py-24 bg-slate-50 text-center px-4">
      <div className="max-w-md mx-auto space-y-4">
        <p className="text-xs font-mono font-semibold text-teal-800">404</p>
        <h1 className="text-2xl font-bold text-[#0B1F3A]">Page Not Found</h1>
        <p className="text-sm text-slate-600">
          The page you requested does not exist or has moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#0B1F3A] hover:bg-[#132F54] rounded-lg min-h-[44px]"
        >
          Return Home
        </Link>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
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
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <CookieBanner />
        <ChatWidget />
      </div>
    </BrowserRouter>
  );
}
