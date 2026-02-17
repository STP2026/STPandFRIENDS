import { MapPin, CheckCircle, AlertCircle, Heart, AlertTriangle, Syringe } from "lucide-react";
import { Dog, REPORT_TYPE_LABELS, ReportType } from "@/types/dog";
import { format } from "date-fns";
import { Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface DogCardProps {
  dog: Dog;
  index: number;
}

const getReportTypeBadge = (reportType: ReportType) => {
  const info = REPORT_TYPE_LABELS[reportType];
  
  const colorClasses: Record<ReportType, string> = {
    save: 'bg-green-500/90 text-white',
    sos: 'bg-red-500/90 text-white',
    stray: 'bg-amber-500/90 text-white',
    vaccination_wish: 'bg-blue-500/90 text-white',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[reportType]}`}>
      {info.emoji} {info.label}
    </span>
  );
};

const DogCard = ({ dog, index }: DogCardProps) => {
  const { t } = useTranslation();
  return (
    <div
      className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 border border-border hover:-translate-y-1 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={dog.photo}
          alt={dog.name}
          loading="lazy"
          decoding="async"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          {getReportTypeBadge(dog.reportType)}
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
              dog.isVaccinated
                ? "bg-safe/90 text-safe-foreground"
                : "bg-warning/90 text-warning-foreground"
            }`}
          >
            {dog.isVaccinated ? (
              <>
                <CheckCircle className="w-3 h-3" />
                {t('dogCard.vaccinated', 'Vaccinated')}
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                {t('dogCard.notVaccinated', 'Not vaccinated')}
              </>
            )}
          </span>
        </div>
        
        {dog.reportType === 'sos' && dog.urgencyLevel && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-fit">
              <AlertTriangle className="w-3 h-3" />
              {t('dogCard.urgency', 'Urgency')}: {dog.urgencyLevel}
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display text-xl font-bold text-foreground">{dog.name}</h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Tag className="w-3.5 h-3.5" />
            <span>{dog.earTag}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{dog.location}</span>
        </div>

        {dog.additionalInfo && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {dog.additionalInfo}
          </p>
        )}

        {dog.reportType === 'save' && dog.sponsorName && (
          <div className="mb-3 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
              <Heart className="w-4 h-4 fill-red-600 dark:fill-red-400" />
              {t('dogCard.sponsorThanks', 'Thank you for your help, {{name}}!', { name: dog.sponsorName })}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Badge variant={dog.isApproved ? 'default' : 'secondary'}>
            {dog.isApproved ? t('dogCard.visible', 'Visible') : t('dogCard.pending', 'Pending')}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(dog.createdAt), "dd.MM.yyyy")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DogCard;
