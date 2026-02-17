import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import SafeDogMap from "@/components/SafeDogMap";
import MapLegend from "@/components/MapLegend";
import { useDogs } from "@/hooks/useDogs";
import { useFacilities } from "@/hooks/useFacilities";
import { useTranslation } from "react-i18next";

const MapPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { data: dogs, isLoading: dogsLoading } = useDogs(true);
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
  const vaccinatedCount = displayDogs.filter((d) => d.isVaccinated).length;

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
                />
              )}
            </div>
            <div className="space-y-4">
              <MapLegend />

              <div className="glass-card rounded-xl p-4 animate-fade-in">
                <h3 className="font-display font-bold text-foreground mb-3">{t('map.stats')}</h3>
                <div className="bg-safe/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-safe">
                    {vaccinatedCount}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('map.safeDogs')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapPage;
