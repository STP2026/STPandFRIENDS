import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Share, Plus, Check, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import logo from "@/assets/logo-dark.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Check if already installed as standalone
    const standalone = window.matchMedia("(display-mode: standalone)").matches 
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone || installed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-8 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-safe/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-safe" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              {t("pwa.alreadyInstalled", "App Already Installed!")}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t("pwa.alreadyInstalledDesc", "You can access Save The Paws directly from your home screen.")}
            </p>
            <Link to="/">
              <Button variant="hero" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t("common.home", "Go Home")}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto">
          {/* App Icon Preview */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-3xl shadow-strong mx-auto mb-4 overflow-hidden bg-card">
              <img src={logo} alt="Save The Paws" className="w-full h-full object-contain p-2" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t("pwa.pageTitle", "Install Save The Paws")}
            </h1>
            <p className="text-muted-foreground">
              {t("pwa.pageDescription", "Get the full app experience on your device")}
            </p>
          </div>

          {/* Benefits */}
          <div className="glass-card rounded-2xl p-5 mb-6">
            <h2 className="font-semibold text-foreground mb-4">
              {t("pwa.benefits", "App Benefits")}
            </h2>
            <ul className="space-y-3">
              {[
                { icon: Smartphone, text: t("pwa.benefit1", "Works offline") },
                { icon: Download, text: t("pwa.benefit2", "Quick access from home screen") },
                { icon: Check, text: t("pwa.benefit3", "No app store needed") },
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Installation Instructions */}
          {isIOS ? (
            <div className="glass-card rounded-2xl p-5 mb-6">
              <h2 className="font-semibold text-foreground mb-4">
                {t("pwa.iosTitle", "How to Install on iPhone/iPad")}
              </h2>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      {t("pwa.iosStep1", "Tap the")} <Share className="w-4 h-4 inline mx-1" /> {t("pwa.shareButton", "Share button")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      {t("pwa.iosStep2", "Scroll down and tap")} <strong>"Add to Home Screen"</strong>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      {t("pwa.iosStep3", "Tap")} <Plus className="w-4 h-4 inline mx-1" /> <strong>"Add"</strong>
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          ) : deferredPrompt ? (
            <Button 
              onClick={handleInstall} 
              variant="hero" 
              size="lg" 
              className="w-full gap-3 text-lg py-6"
            >
              <Download className="w-5 h-5" />
              {t("pwa.installButton", "Install App")}
            </Button>
          ) : isAndroid ? (
            <div className="glass-card rounded-2xl p-5 mb-6">
              <h2 className="font-semibold text-foreground mb-4">
                {t("pwa.androidTitle", "How to Install on Android")}
              </h2>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      {t("pwa.androidStep1", "Tap the browser menu (⋮)")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      {t("pwa.androidStep2", 'Select "Install app" or "Add to Home screen"')}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      {t("pwa.androidStep3", 'Tap "Install" to confirm')}
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-5 text-center">
              <p className="text-muted-foreground text-sm">
                {t("pwa.desktopMessage", "Open this page on your mobile device to install the app.")}
              </p>
            </div>
          )}

          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-primary hover:underline">
              {t("pwa.skipInstall", "Continue without installing")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstallPage;
