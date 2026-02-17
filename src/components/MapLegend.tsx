import { CheckCircle, AlertCircle, Stethoscope, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

const MapLegend = () => {
  const { t } = useTranslation();

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in">
      <h3 className="font-display font-bold text-foreground mb-3">{t('map.legend')}</h3>
      <div className="space-y-3">
        {/* Dogs */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-safe/20 border-2 border-safe flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-safe" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{t('map.safeDogs')}</p>
            <p className="text-xs text-muted-foreground">{t('map.vaccinatedDogs')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-warning/20 border-2 border-warning flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-warning" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{t('map.pending')}</p>
            <p className="text-xs text-muted-foreground">{t('map.notVaccinated')}</p>
          </div>
        </div>

        {/* Facilities */}
        <div className="border-t border-border pt-3 mt-3">
          <p className="text-xs text-muted-foreground mb-2">{t('map.facilities')}</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-md bg-destructive/10 border-2 border-destructive flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t('facilities.vet')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary/10 border-2 border-primary flex items-center justify-center">
              <Home className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">PawFriend</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
