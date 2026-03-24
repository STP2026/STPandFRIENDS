import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import SafeDogMap from "@/components/SafeDogMap";
import MapLegend from "@/components/MapLegend";
import { useDogs } from "@/hooks/useDogs";
import { useFacilities } from "@/hooks/useFacilities";
import { useAuth } from "@/contexts/AuthContext";
import { useIsHelper } from "@/hooks/useHelperApplication";
import { useTranslation } from "react-i18next";
import { Syringe } from "lucide-react";
import { Button } from "@/components/ui/button";

const MapPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const { data: isHelper } = useIsHelper(user?.id);
  const isElevated = isAdmin || !!isHelper;

  // Deep-link: ?show=vaccination activates the filter by default
  const showParam = searchParams.get('show');
  const [showVaccination, setShowVaccination] = useState(showParam === 'vaccination');

  // isElevated=true: helper/admin (all dogs)
  // isElevated=false: regular logged-in user (own dogs + approved save)
  // null: guest (no fetch)
  const dogsFetchMode = !user ? null : isElevated ? true : false;
  const { data: dogs, isLoading: dogsLoading } = useDogs(dogsFetchMode);
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();
  
  // Parse URL params for centering on specific dog
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const dogIdParam = searchParams.get('dog');
  
  const initialCenter = latParam && lngParam 
    ? [parseFloat(latParam), parseFloat(lngParam)] as [number, number]
    : undefined;
  
  const isLoading = dogsLoading || facilitiesLoading;

  // Filter facilities: vaccination centers are toggled separately
  const displayFacilities = (facilities || []).filter((f) => {
    if (f.type === 'vaccination_center') return showVaccination;
    return true; // vets & friends always shown
  });

  // Elevated: all dogs | Regular user: own dogs | Guest: empty
  const displayDogs = user ? (dogs || []) : [];

  // Stats
  const taggedCount = displayDogs.filter((d) => d.reportType === 'save').length;
  const strayCount = displayDogs.filter((d) => d.reportType === 'stray').length;
  const sosCount = displayDogs.filter((d) => d.reportType === 'sos').length;
  const tagWishCount = displayDogs.filter((d) => d.reportType === 'vaccination_wish').length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 animate-fade-in">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {t('common.map')}
            </h1>
            <p className="text-muted-foreground">
              {t('map.description')}
            </p>

            {/* Vaccination center toggle */}
            <div className="mt-3">
              <Button
                variant={showVaccination ? "default" : "outline"}
                size="sm"
                className={`gap-2 text-sm ${showVaccination ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950/30'}`}
                onClick={() => setShowVaccination(!showVaccination)}
              >
                <Syringe className="w-4 h-4" />
                💉 {t('map.vaccinationCenters', 'Rabies Vaccination Centers')}
              </Button>
            </div>
          </div>



          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-[calc(100svh-56px)] bg-secondary/50 rounded-xl">
                  <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
              ) : (
                <SafeDogMap 
                  dogs={displayDogs} 
                  facilities={displayFacilities} 
                  height="calc(100svh - 56px)" 
                  center={initialCenter}
                  zoom={initialCenter ? 15 : undefined}
                  focusDogId={dogIdParam || undefined}
                  showReportTypes={isElevated}
                />
              )}
            </div>
            <div className="space-y-4">
              <MapLegend isElevated={isElevated} />

              {/* Info banner for non-elevated users */}
              {!isElevated && (
                <div className="glass-card rounded-xl p-4 animate-fade-in border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🔒</span>
                    <div>
                      <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">
                        {t('map.helperOnlyTitle', 'Hundedaten nur für Helfer')}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {t('map.helperOnlyDesc', 'Verifizierte Helfer sehen alle gemeldeten Hunde auf der Karte.')}
                      </p>
                      <a href="/become-helper" className="text-xs font-semibold text-amber-700 dark:text-amber-400 underline">
                        {t('map.becomeHelper', 'Helfer werden →')}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Dog Aid hint */}
              <a
                href="https://aid.save-the-paws.de/dog-aid"
                target="_blank"
                rel="noopener noreferrer"
                className="block glass-card rounded-xl p-4 animate-fade-in border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🐾</span>
                  <div>
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-400 group-hover:underline">
                      {t('map.dogAidTitle', 'Found a dog in need?')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('map.dogAidHint', 'Learn how to help — step by step guide for tourists & locals.')}
                    </p>
                  </div>
                </div>
              </a>

              {isElevated && (
              <div className="glass-card rounded-xl p-4 animate-fade-in">
                <h3 className="font-display font-bold text-foreground mb-3">{t('map.stats')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2.5 text-center">
                    <p className="text-xl font-bold text-green-600">{taggedCount}</p>
                    <p className="text-xs text-muted-foreground">Tagged</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-2.5 text-center">
                    <p className="text-xl font-bold text-yellow-600">{strayCount}</p>
                    <p className="text-xs text-muted-foreground">Stray</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-2.5 text-center">
                    <p className="text-xl font-bold text-red-600">{sosCount}</p>
                    <p className="text-xs text-muted-foreground">Attention</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-2.5 text-center">
                    <p className="text-xl font-bold text-purple-600">{tagWishCount}</p>
                    <p className="text-xs text-muted-foreground">Tag Wish</p>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapPage;
