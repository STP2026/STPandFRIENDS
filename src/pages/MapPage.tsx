import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import SafeDogMap from "@/components/SafeDogMap";
import MapLegend from "@/components/MapLegend";
import { useDogs } from "@/hooks/useDogs";
import { useFacilities } from "@/hooks/useFacilities";
import { useAuth } from "@/contexts/AuthContext";
import { useIsHelper } from "@/hooks/useHelperApplication";
import { useTranslation } from "react-i18next";

const MapPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const { data: isHelper } = useIsHelper(user?.id);
  const isElevated = isAdmin || !!isHelper;

  // Helpers/admins see ALL dogs; regular users see only approved
  const { data: dogs, isLoading: dogsLoading } = useDogs(!isElevated);
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();
  
  // Parse URL params for centering on specific dog
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const dogIdParam = searchParams.get('dog');
  
  const initialCenter = latParam && lngParam 
    ? [parseFloat(latParam), parseFloat(lngParam)] as [number, number]
    : undefined;
  
  const isLoading = dogsLoading || facilitiesLoading;
  const displayDogs = dogs || [];
  const displayFacilities = facilities || [];

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
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-secondary/50 rounded-xl">
                  <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
              ) : (
                <SafeDogMap 
                  dogs={displayDogs} 
                  facilities={displayFacilities} 
                  height="calc(100vh - 200px)" 
                  center={initialCenter}
                  zoom={initialCenter ? 15 : undefined}
                  focusDogId={dogIdParam || undefined}
                  showReportTypes={isElevated}
                />
              )}
            </div>
            <div className="space-y-4">
              <MapLegend isElevated={isElevated} />

              <div className="glass-card rounded-xl p-4 animate-fade-in">
                <h3 className="font-display font-bold text-foreground mb-3">{t('map.stats')}</h3>

                {!isElevated ? (
                  /* ── User: single green stat ── */
                  <div className="bg-safe/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-safe">{taggedCount}</p>
                    <p className="text-xs text-muted-foreground">{t('map.safeDogs')}</p>
                  </div>
                ) : (
                  /* ── Helper / Admin: breakdown by report type ── */
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
                      <p className="text-xs text-muted-foreground">SOS</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-2.5 text-center">
                      <p className="text-xl font-bold text-purple-600">{tagWishCount}</p>
                      <p className="text-xs text-muted-foreground">Tag Wish</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapPage;
