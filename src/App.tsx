import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OfflineProvider } from "@/contexts/OfflineContext";
import { I18nextProvider } from "react-i18next";
import { Suspense, lazy } from "react";
import i18n from "@/i18n";

// Eagerly load lightweight pages
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AuthConfirmPage from "./pages/AuthConfirmPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import InstallPWA from "./components/InstallPWA";
import OfflineIndicator from "./components/OfflineIndicator";
import DirectionHandler from "./components/DirectionHandler";

// Lazy load heavy pages — Leaflet (~150KB) only loads when map page is visited
const MapPage = lazy(() => import("./pages/MapPage"));
const AddDogPage = lazy(() => import("./pages/AddDogPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const BecomeHelperPage = lazy(() => import("./pages/BecomeHelperPage"));
const InstallPage = lazy(() => import("./pages/InstallPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PawFriendsPage = lazy(() => import("./pages/PawFriendsPage"));

import AutoLogoutWarning from "@/components/AutoLogoutWarning";

// Loading fallback for lazy pages
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="text-sm">Loading...</span>
    </div>
  </div>
);

// Configured QueryClient: limits retries, sets sane timeouts, prevents cascading failures
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Only retry once on failure (default is 3 — causes long hangs on mobile)
      retry: 1,
      retryDelay: 1000,
      // Data stays fresh for 2 minutes — prevents unnecessary refetches
      staleTime: 1000 * 60 * 2,
      // Keep unused data in cache for 5 minutes
      gcTime: 1000 * 60 * 5,
      // Prevent refetch on window focus (common PWA source of jank)
      refetchOnWindowFocus: false,
      // Still refetch when back online after offline
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Auto-logout after 30min inactivity


const App = () => (
  <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AutoLogoutWarning />
        <OfflineProvider>
          <BrowserRouter>
            <DirectionHandler />
            <OfflineIndicator />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/add" element={<AddDogPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/confirm" element={<AuthConfirmPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/pawfriends" element={<PawFriendsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/become-helper" element={<BecomeHelperPage />} />
                <Route path="/install" element={<InstallPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <InstallPWA />
          </BrowserRouter>
        </OfflineProvider>
      </AuthProvider>
    </QueryClientProvider>
  </I18nextProvider>
);

export default App;
