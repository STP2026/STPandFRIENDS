import { useState } from "react";
import Header from "@/components/Header";
import DonationSection from "@/components/DonationSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dog, Camera, MapPin, Tag, FileText, CheckCircle, Heart, Syringe, WifiOff, Facebook, ExternalLink } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import SafeDogMap from "@/components/SafeDogMap";
import PhotoUpload from "@/components/PhotoUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useAddDog } from "@/hooks/useDogs";
import { useOfflineContext } from "@/contexts/OfflineContext";
import { supabase } from "@/integrations/supabase/client";
import { ReportType, REPORT_TYPE_LABELS, USER_REPORT_TYPES } from "@/types/dog";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FACEBOOK_GROUP = "https://www.facebook.com/share/g/1AsLrfAibF/?mibextid=K35XfP";
const DOG_AID_URL = "https://aid.save-the-paws.de/dog-aid";


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
  const { isOnline, addReportToQueue, pendingCount, syncQueue } = useOfflineContext();
  const addDogMutation = useAddDog();
  const [submitted, setSubmitted] = useState(false);
  const [submittedOffline, setSubmittedOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    earTag: "",
    photoUrls: ["", "", ""] as [string, string, string],
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
    if (!selectedPosition) return;
    setIsSubmitting(true);

    // Guest report: insert into guest_reports table
    if (!user) {
      try {
        const { error } = await supabase
          .from('guest_reports')
          .insert({
            report_type: formData.reportType,
            latitude: selectedPosition.lat,
            longitude: selectedPosition.lng,
            location: formData.location,
            photo_url: formData.photoUrls[0] || null,
            photo_url_2: formData.photoUrls[1] || null,
            photo_url_3: formData.photoUrls[2] || null,
            additional_info: formData.additionalInfo || null,
            name: formData.name || null,
          });
        if (error) throw error;
        setSubmitted(true);
      } catch (err) {
        console.error('Guest report error:', err);
        // Still show success — don't leave tourist hanging
        setSubmitted(true);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Logged-in user report
    const reportData = {
      name: formData.name,
      earTag: formData.earTag,
      latitude: selectedPosition.lat,
      longitude: selectedPosition.lng,
      location: formData.location,
      photo: formData.photoUrls[0] || '',
      photo2: formData.photoUrls[1] || '',
      photo3: formData.photoUrls[2] || '',
      isVaccinated: formData.isVaccinated,
      additionalInfo: formData.additionalInfo || undefined,
      reportedBy: user.id,
      reportType: formData.reportType,
      urgencyLevel: undefined,
    };

    try {
      // Always try direct submit first — isOnline is unreliable on mobile data
      await addDogMutation.mutateAsync(reportData);
      setSubmitted(true);
    } catch (error) {
      // Direct submit failed — save to offline queue for later sync
      console.error('Submit failed, saving to offline queue:', error);
      addReportToQueue(reportData);
      setSubmittedOffline(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'save': return <Heart className="w-5 h-5 text-green-500" />;
      case 'stray': return <Dog className="w-5 h-5 text-amber-500" />;
      case 'vaccination_wish': return <Syringe className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSubmissionMessage = () => {
    switch (formData.reportType) {
      case 'save': return t('addDog.visibility.save');
      case 'stray': return t('addDog.visibility.stray');
      default: return t('addDog.visibility.vaccination');
    }
  };

  // ── SUCCESS SCREEN ──
  if (submitted || submittedOffline) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-lg space-y-5">

            {/* Thank you card */}
            <div className="glass-card rounded-2xl p-8 text-center animate-fade-in">
              {submittedOffline ? (
                <>
                  <WifiOff className="w-14 h-14 text-amber-500 mx-auto mb-4" />
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    {t('addDog.offlineSaved')}
                  </h2>
                  <p className="text-muted-foreground">
                    {t('addDog.offlineMessage', { name: formData.name })}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4">🐾</div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    {t('addDog.successTitle', 'Danke für deine Meldung!')}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {user
                      ? `${formData.name ? formData.name + ': ' : ''}${getSubmissionMessage()}`
                      : t('addDog.guestSuccessDesc', 'Deine Meldung ist bei uns eingegangen. Unser Team kümmert sich darum.')}
                  </p>
                </>
              )}
            </div>

            {/* Dog Aid banner — always show for sos, also show for stray as reminder */}
            {formData.reportType === 'stray' && (
              <a
                href={DOG_AID_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block glass-card rounded-2xl p-5 border-2 border-red-400 bg-red-50 dark:bg-red-950/30 animate-fade-in hover:border-red-500 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🚨</span>
                  <div>
                    <p className="font-bold text-red-700 dark:text-red-400 mb-1">
                      {t('addDog.dogAidBannerTitle', 'Hund verletzt oder in Not?')}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300 mb-2">
                      {t('addDog.dogAidBannerDesc', 'Unser Dog Aid Guide erklärt Schritt für Schritt wie du sofort helfen kannst — auch ohne Tierarzt.')}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 dark:text-red-400">
                      Dog Aid Guide öffnen <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </a>
            )}

            {/* Facebook follow */}
            <a
              href={FACEBOOK_GROUP}
              target="_blank"
              rel="noopener noreferrer"
              className="block glass-card rounded-2xl p-5 border border-blue-200 dark:border-blue-800 hover:border-blue-400 transition-colors animate-fade-in"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 rounded-xl p-3 shrink-0">
                  <Facebook className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-foreground mb-0.5">
                    {t('addDog.facebookTitle', 'Bleib informiert')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('addDog.facebookDesc', 'Folge uns auf Facebook für Hunde-Updates aus der Region.')}
                  </p>
                </div>
              </div>
            </a>

            {/* Donation */}
            <DonationSection variant="afterReport" />

            {/* Register CTA for guests */}
            {!user && (
              <div className="glass-card rounded-2xl p-6 text-center animate-fade-in border border-primary/20">
                <p className="font-bold text-foreground mb-1">
                  {t('addDog.registerCta', 'Möchtest du mehr mithelfen?')}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('addDog.registerCtaDesc', 'Mit einem kostenlosen Konto kannst du Meldungen verfolgen und unser Team direkt unterstützen.')}
                </p>
                <Link to="/auth">
                  <Button className="w-full gap-2">
                    <Heart className="w-4 h-4" />
                    {t('addDog.registerCtaButton', 'Kostenlos registrieren')}
                  </Button>
                </Link>
              </div>
            )}

            <div className="text-center">
              <Button onClick={() => navigate("/")} variant="outline">
                {t('addDog.backToHome', 'Zurück zur Startseite')}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── FORM ──
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

          {/* Dog Aid hint — prominent above the form */}
          <a
            href={DOG_AID_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block glass-card rounded-xl p-4 mb-6 border-2 border-red-200 dark:border-red-800 hover:border-red-400 transition-colors animate-fade-in"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-400">
                  {t('addDog.dogAidHintTitle', 'Hund verletzt oder in akuter Not?')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('addDog.dogAidHintDesc', 'Erst Hilfe leisten — dann melden. Unser Dog Aid Guide zeigt wie.')}
                  <span className="ml-1 text-red-600 font-medium underline">{t('addDog.dogAidHintLink', 'Jetzt öffnen →')}</span>
                </p>
              </div>
            </div>
          </a>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report Type */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                {t('addDog.reportType.title')}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {USER_REPORT_TYPES.map((type) => {
                  const info = REPORT_TYPE_LABELS[type];
                  return (
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
                        {type === 'stray' && t('addDog.reportType.strayDesc')}
                        {type === 'vaccination_wish' && t('addDog.reportType.vaccinationDesc')}
                      </p>
                    </button>
                  );
                })}
              </div>
              {formData.reportType === 'save' && (
                <p className="mt-4 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                  {t('addDog.visibility.save')}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground/70 flex items-center gap-1.5">
                <span>ℹ️</span>
                {t('addDog.communityNote', 'Alle Meldungen werden durch den lokalen Tierschutz registriert und stehen Helfern zur Verfügung.')}
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
                  <Label htmlFor="name">
                    {t('addDog.name')}
                    <span className="ml-1 text-xs text-muted-foreground font-normal">({t('common.optional', 'optional')})</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder={t('addDog.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                {user && (
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
                )}
              </div>
              <div className="mt-4 space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  {t('addDog.photo')}
                </Label>
                <PhotoUpload
                  onPhotosUploaded={(urls) => setFormData({ ...formData, photoUrls: urls })}
                  currentPhotoUrls={formData.photoUrls}
                />
              </div>
            </div>

            {/* Location */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {t('addDog.location')}{!selectedPosition && <span className="text-red-500 ml-1 text-xs">{t('addDog.locationRequired', '(Pflicht)')}</span>}
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{t('addDog.locationHint')}</p>
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
                {user && formData.reportType !== 'vaccination_wish' && (
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
                    placeholder={t('addDog.additionalNotesPlaceholder')}
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
