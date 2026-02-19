import { MapPin, Plus, User, Shield, Menu, X, Heart, LogOut, Info, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsHelper } from "@/hooks/useHelperApplication";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import logoHeader from "@/assets/logo-header.png";

const HUMAN_AID_URL = "https://save-the-paws.de/first-aid";
const DOG_AID_URL = "https://save-the-paws.de/dog-first-aid";

// ── Custom SVG Icons ──

// Red heart with white cross — Human First Aid
const HumanAidIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-label="Human First Aid">
    <path
      d="M16 28s-11-7.2-11-14.5C5 9.4 8.4 6 12.5 6c2.2 0 3.5 1.5 3.5 1.5S17.8 6 20 6c3.6 0 6.5 3.4 6.5 7.5C26.5 20.8 16 28 16 28z"
      fill="#dc2626"
    />
    <rect x="14" y="11" width="4" height="10" rx="0.8" fill="white" />
    <rect x="11" y="14" width="10" height="4" rx="0.8" fill="white" />
  </svg>
);

// Blue paw with small white cross — Dog First Aid
const DogAidIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-label="Dog First Aid">
    {/* Paw pads */}
    <ellipse cx="10.5" cy="9" rx="3" ry="3.5" fill="#2563eb" />
    <ellipse cx="21.5" cy="9" rx="3" ry="3.5" fill="#2563eb" />
    <ellipse cx="6.5" cy="16" rx="2.8" ry="3.2" fill="#2563eb" />
    <ellipse cx="25.5" cy="16" rx="2.8" ry="3.2" fill="#2563eb" />
    {/* Main pad */}
    <ellipse cx="16" cy="22" rx="7" ry="6" fill="#2563eb" />
    {/* Small white cross on main pad */}
    <rect x="14.8" y="18.5" width="2.4" height="7" rx="0.6" fill="white" />
    <rect x="12.5" y="20.8" width="7" height="2.4" rx="0.6" fill="white" />
  </svg>
);

// ── Speech Bubble Component ──
const TOOLTIP_STORAGE_KEY = "stp-aid-tooltips-shown";

const AidTooltips = () => {
  const [activeTooltip, setActiveTooltip] = useState<"human" | "dog" | null>(null);

  useEffect(() => {
    // Only show once per browser
    try {
      if (sessionStorage.getItem(TOOLTIP_STORAGE_KEY)) return;
    } catch { /* private browsing */ }

    const timer1 = setTimeout(() => setActiveTooltip("human"), 5000);
    const timer2 = setTimeout(() => setActiveTooltip("dog"), 8000);
    const timer3 = setTimeout(() => {
      setActiveTooltip(null);
      try { sessionStorage.setItem(TOOLTIP_STORAGE_KEY, "1"); } catch {}
    }, 11000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  if (!activeTooltip) return null;

  return (
    <div
      className="absolute top-full mt-2 z-[60] pointer-events-none"
      style={{ left: activeTooltip === "human" ? "-4px" : undefined, right: activeTooltip === "dog" ? "-4px" : undefined }}
    >
      <div className="relative bg-card border border-border shadow-lg rounded-lg px-3 py-2 text-xs font-medium text-foreground whitespace-nowrap animate-fade-in">
        {/* Arrow — positioned over the correct icon */}
        <div
          className="absolute -top-1.5 w-3 h-3 bg-card border-l border-t border-border rotate-45"
          style={{ left: activeTooltip === "human" ? "16px" : undefined, right: activeTooltip === "dog" ? "16px" : undefined }}
        />
        {activeTooltip === "human" ? "FirstAid support for you" : "DogHelp – How to act"}
      </div>
    </div>
  );
};

const Header = () => {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { data: isHelper } = useIsHelper(user?.id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  
  const isActive = (path: string) => location.pathname === path;
  const canAccessDashboard = isAdmin || isHelper;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b animate-fade-in">
      <div className="container mx-auto px-2 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoHeader} alt="Save The Paws – Agadir" className="h-10 sm:h-12 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t('common.home')}
          </Link>
          <Link
            to="/map"
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${
              isActive("/map") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapPin className="w-4 h-4" />
            {t('common.map')}
          </Link>
          <Link
            to="/dogs"
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${
              isActive("/dogs") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className="w-4 h-4" />
            {t('common.dogs')}
          </Link>
          <Link
            to="/about"
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${
              isActive("/about") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Info className="w-4 h-4" />
            {t('common.about')}
          </Link>
          <Link
            to="/contact"
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${
              isActive("/contact") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Phone className="w-4 h-4" />
            {t('contact.navLabel', 'Contact')}
          </Link>
          {canAccessDashboard && (
            <Link
              to="/admin"
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                isActive("/admin") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="w-4 h-4" />
              {isAdmin ? t('common.admin') : t('common.dashboard')}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />

          {/* ── First Aid Icons ── */}
          <div className="relative flex items-center gap-0.5 sm:gap-1">
            {/* Human First Aid */}
            <a
              href={HUMAN_AID_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="First Aid – for you"
              className="inline-flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <HumanAidIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </a>
            {/* Dog First Aid */}
            <a
              href={DOG_AID_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Dog First Aid – how to act"
              className="inline-flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            >
              <DogAidIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </a>

            {/* Speech bubble tooltips — once per session */}
            <AidTooltips />
          </div>

          {user && (
            <Link to="/add">
              <Button variant="hero" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('common.report')}</span>
              </Button>
            </Link>
          )}
          {user ? (
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
              onClick={signOut}
              title={t('common.logout')}
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </Link>
          )}
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-8 w-8 sm:h-10 sm:w-10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-t">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium transition-colors ${
                isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t('common.home')}
            </Link>
            <Link
              to="/map"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive("/map") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="w-4 h-4" />
              {t('common.map')}
            </Link>
            <Link
              to="/dogs"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive("/dogs") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className="w-4 h-4" />
              {t('common.dogs')}
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive("/about") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Info className="w-4 h-4" />
              {t('common.about')}
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive("/contact") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone className="w-4 h-4" />
              {t('contact.navLabel', 'Contact')}
            </Link>
            {canAccessDashboard && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive("/admin") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="w-4 h-4" />
                {isAdmin ? t('common.admin') : t('common.dashboard')}
              </Link>
            )}

            {/* First Aid links in mobile menu */}
            <div className="border-t border-border pt-3 mt-1 space-y-3">
              <a
                href={HUMAN_AID_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm font-medium text-red-600"
              >
                <HumanAidIcon className="w-5 h-5" />
                First Aid – for you
              </a>
              <a
                href={DOG_AID_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm font-medium text-blue-600"
              >
                <DogAidIcon className="w-5 h-5" />
                Dog First Aid – how to act
              </a>
            </div>

            {!user && (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-primary"
              >
                <User className="w-4 h-4" />
                {t('common.login')}
              </Link>
            )}
            {user && !canAccessDashboard && (
              <Link
                to="/become-helper"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-primary"
              >
                <Heart className="w-4 h-4" />
                {t('common.becomeHelper')}
              </Link>
            )}
            {user && (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('common.logout')}
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
