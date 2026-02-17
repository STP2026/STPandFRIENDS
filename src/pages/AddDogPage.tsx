import { useState } from "react";
import Header from "@/components/Header";
import DonationSection from "@/components/DonationSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dog, Camera, MapPin, Tag, FileText, CheckCircle, AlertTriangle, Heart, Syringe, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SafeDogMap from "@/components/SafeDogMap";
import PhotoUpload from "@/components/PhotoUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useAddDog } from "@/hooks/useDogs";
import { useOfflineContext } from "@/contexts/OfflineContext";
import { ReportType, REPORT_TYPE_LABELS } from "@/types/dog";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getUrgencyLevels = (t: (key: string) => string) => [
  { value: 'low', label: t('addDog.urgencyLevels.low'), description: t('addDog.urgencyLevels.lowDesc') },
  { value: 'medium', label: t('addDog.urgencyLevels.medium'), description: t('addDog.urgencyLevels.mediumDesc') },
  { value: 'high', label: t('addDog.urgencyLevels.high'), description: t('addDog.urgencyLevels.highDesc') },
  { value: 'critical', label: t('addDog.urgencyLevels.critical'), description: t('addDog.urgencyLevels.criticalDesc') },
];

const AddDogPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnline, addReportToQueue, pendingCount } = useOfflineContext();
  const addDogMutation = useAddDog();
  const [submitted, setSubmitted] = useState(false);
  const [submittedOffline, setSubmittedOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    earTag: "",
    photoUrl: "",
    location: "",
    isVaccinated: false,
    additionalInfo: "",
    reportType: "stray" as ReportType,
    urgencyLevel: "",
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
    setFormData({ ...formData, location: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPosition || !user) {
      return;
    }

    setIsSubmitting(true);
    
    const reportData = {
      name: formData.name,
      earTag: formData.earTag,
      latitude: selectedPosition.lat,
      longitude: selectedPosition.lng,
      location: formData.location,
      photo: formData.photoUrl || '',
      isVaccinated: formData.isVaccinated,
      additionalInfo: formData.additionalInfo || undefined,
      reportedBy: user.id,
      reportType: formData.reportType,
      urgencyLevel: formData.reportType === 'sos' ? formData.urgencyLevel : undefined,
    };

    try {
      if (isOnline) {
        // Online: Submit directly
        await addDogMutation.mutateAsync(reportData);
        setSubmitted(true);
      } else {
        // Offline: Add to queue
        addReportToQueue(reportData);
        setSubmittedOffline(true);
      }
      
      setTimeout(() => navigate("/dogs"), 2000);
    } catch (error) {
      console.error('Error submitting dog:', error);
      // If online submit fails, try adding to offline queue
      if (isOnline) {
        addReportToQueue(reportData);
        setSubmittedOffline(true);
        setTimeout(() => navigate("/dogs"), 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'save': return <Heart className="w-5 h-5 text-green-500" />;
      case 'sos': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'stray': return <Dog className="w-5 h-5 text-amber-500" />;
      case 'vaccination_wish': return <Syringe className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSubmissionMessage = () => {
    switch (formData.reportType) {
      case 'save':
        return t('addDog.visibility.save');
      case 'sos':
        return t('addDog.visibility.sos');
      case 'stray':
        return t('addDog.visibility.stray');
      default:
        return t('addDog.visibility.vaccination');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <div className="glass-card rounded-xl p-8 animate-fade-in">
              <Dog className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {t('addDog.loginRequired')}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t('addDog.loginRequiredDesc')}
              </p>
              <Button onClick={() => navigate('/auth')}>{t('auth.login')}</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (submitted || submittedOffline) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-lg space-y-6">
            <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
              {submittedOffline ? (
                <>
                  <WifiOff className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    {t('addDog.offlineSaved')}
                  </h2>
                  <p className="text-muted-foreground">
                    {t('addDog.offlineMessage', { name: formData.name })}
                  </p>
                  {pendingCount > 1 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {t('addDog.offlineQueueMessage', { count: pendingCount })}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    {t('addDog.reportSent')}
                  </h2>
                  <p className="text-muted-foreground">
                    {formData.name}: {getSubmissionMessage()}
                  </p>
                </>
              )}
            </div>
            
            {/* Donation appeal after report */}
            <DonationSection variant="afterReport" />
            
            <div className="text-center">
              <Button onClick={() => navigate("/dogs")} variant="outline">
                {t('addDog.backToList')}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {t('addDog.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('addDog.description')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report Type Selection */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                {t('addDog.reportType.title')}
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(REPORT_TYPE_LABELS) as [ReportType, typeof REPORT_TYPE_LABELS[ReportType]][]).map(([type, info]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, reportType: type })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.reportType === type
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getReportTypeIcon(type)}
                      <span className="font-medium">{info.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {type === 'save' && t('addDog.reportType.saveDesc')}
                      {type === 'sos' && t('addDog.reportType.sosDesc')}
                      {type === 'stray' && t('addDog.reportType.strayDesc')}
                      {type === 'vaccination_wish' && t('addDog.reportType.vaccinationDesc')}
                    </p>
                  </button>
                ))}
              </div>

              {formData.reportType === 'sos' && (
                <div className="mt-4 space-y-2">
                  <Label>{t('addDog.urgency')}</Label>
                  <Select
                    value={formData.urgencyLevel}
                    onValueChange={(value) => setFormData({ ...formData, urgencyLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('addDog.urgencyPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {getUrgencyLevels(t).map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{level.label}</span>
                            <span className="text-muted-foreground text-sm">- {level.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <p className="mt-4 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                {formData.reportType === 'save' && t('addDog.visibility.save')}
                {formData.reportType === 'sos' && t('addDog.visibility.sos')}
                {formData.reportType === 'stray' && t('addDog.visibility.stray')}
                {formData.reportType === 'vaccination_wish' && t('addDog.visibility.vaccination')}
              </p>
              
              {formData.reportType === 'vaccination_wish' && (
                <div className="mt-4">
                  <DonationSection variant="compact" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Dog className="w-5 h-5 text-primary" />
                {t('addDog.basicInfo')}
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('addDog.name')}</Label>
                  <Input
                    id="name"
                    placeholder={t('addDog.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="earTag" className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {t('addDog.earTag')}
                    <span className="text-xs text-muted-foreground font-normal">({t('common.optional', 'optional')})</span>
                  </Label>
                  <Input
                    id="earTag"
                    placeholder={t('addDog.earTagPlaceholder')}
                    value={formData.earTag}
                    onChange={(e) => setFormData({ ...formData, earTag: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  {t('addDog.photo')}
                </Label>
                <PhotoUpload
                  onPhotoUploaded={(url) => setFormData({ ...formData, photoUrl: url })}
                  currentPhotoUrl={formData.photoUrl}
                />
              </div>
            </div>

            {/* Location with Map */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {t('addDog.location')}
              </h2>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('addDog.locationHint')}
                </p>
                
                <SafeDogMap
                  dogs={[]}
                  height="300px"
                  selectable={true}
                  onLocationSelect={handleLocationSelect}
                />

                {formData.location && (
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <Label className="text-xs text-muted-foreground">{t('addDog.selectedLocation')}</Label>
                    <p className="text-sm font-medium text-foreground">{formData.location}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {t('addDog.additionalDetails')}
              </h2>
              
              <div className="space-y-4">
                {formData.reportType !== 'vaccination_wish' && (
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 ${formData.isVaccinated ? "text-green-600" : "text-muted-foreground"}`} />
                      <div>
                        <Label htmlFor="vaccinated" className="cursor-pointer">{t('addDog.vaccinated')}</Label>
                        <p className="text-xs text-muted-foreground">{t('addDog.vaccinatedHint')}</p>
                      </div>
                    </div>
                    <Switch
                      id="vaccinated"
                      checked={formData.isVaccinated}
                      onCheckedChange={(checked) => setFormData({ ...formData, isVaccinated: checked })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">{t('addDog.additionalNotes')}</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder={
                      formData.reportType === 'sos' 
                        ? t('addDog.sosNotesPlaceholder')
                        : t('addDog.additionalNotesPlaceholder')
                    }
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 animate-fade-in">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1 sm:flex-none">
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                className="flex-1 sm:flex-none gap-2"
                disabled={isSubmitting || !selectedPosition}
              >
                {getReportTypeIcon(formData.reportType)}
                {isSubmitting ? t('addDog.submitting') : t('addDog.submit')}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddDogPage;
