import { CheckCircle, AlertCircle, AlertTriangle, Syringe, Stethoscope, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MapLegendProps {
  /** true for helpers/admins — shows all report type pins */
  isElevated?: boolean;
}

const MapLegend = ({ isElevated = false }: MapLegendProps) => {
  const { t } = useTranslation();

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in">
      <h3 className="font-display font-bold text-foreground mb-3">{t('map.legend')}</h3>
      <div className="space-y-3">

        {/* ── User view: just "tagged / safe" ── */}
        {!isElevated && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-safe/20 border-2 border-safe flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-safe" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t('map.safeDogs')}</p>
              <p className="text-xs text-muted-foreground">{t('map.vaccinatedDogs')}</p>
            </div>
          </div>
        )}

        {/* ── Helper / Admin view: all report types ── */}
        {isElevated && (
          <>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-600 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Tagged</p>
                <p className="text-xs text-muted-foreground">{t('map.vaccinatedDogs')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 border-2 border-yellow-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Stray</p>
                <p className="text-xs text-muted-foreground">{t('mapLegend.strayDesc', 'Reported stray — no tag')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-red-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">SOS</p>
                <p className="text-xs text-muted-foreground">{t('mapLegend.sosDesc', 'Needs help')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-purple-600 flex items-center justify-center">
                <Syringe className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Tag Wish</p>
                <p className="text-xs text-muted-foreground">{t('mapLegend.tagWishDesc', 'Vaccination / tag requested')}</p>
              </div>
            </div>
          </>
        )}

        {/* ── Facilities (shown in both views) ── */}
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
