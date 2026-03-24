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
import { useIsHelper } from "@/hooks/useHelperApplication";
import { useOfflineContext } from "@/contexts/OfflineContext";
import { supabase } from "@/integrations/supabase/client";
import { ReportType, REPORT_TYPE_LABELS, USER_REPORT_TYPES } from "@/types/dog";
import { useTranslation } from "react-i18next";

const FACEBOOK_GROUP = "https://www.facebook.com/share/g/1AsLrfAibF/?mibextid=K35XfP";
const DOG_AID_URL = "https://aid.save-the-paws.de/dog-aid";

const AddDogPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { data: isHelper } = useIsHelper(user?.id);
  const isElevated = isAdmin || !!isHelper;
  const { addReportToQueue } = useOfflineContext();

  const [submitted, setSubmitted] = useState(false);
  const [submittedOffline, setSubmittedOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    earTag: "",
    photoUrls: ["", "", ""] as [string, string, string],
    location: "",
    isVaccinated: false,
    vaccination1Date: "",
    vaccination2Date: "",
    additionalInfo: "",
    reportType: "stray" as ReportType,
    urgencyLevel: "",
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
    setFormData(prev => ({ ...prev, location: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
  };

  const resetForm = () => {
    setSubmitted(false);
    setSubmittedOffline(false);
    setSubmitError(null);
    setHasPhoto(false);
    setIsPhotoUploading(false);
    setSelectedPosition(null);
    setSubmitAttempt(0);
    setFormData({
      name: "", earTag: "",
      photoUrls: ["", "", ""] as [string, string, string],
      location: "", isVaccinated: false,
      vaccination1Date: "", vaccination2Date: "",
      additionalInfo: "", reportType: "stray", urgencyLevel: "",
    });
  };

  // ── SUBMIT ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPosition) return;
    setIsSubmitting(true);
    setSubmitError(null);

    // ── GUEST ──
    if (!user) {
      try {
        let succeeded = false;
        let lastErr: unknown;
        for (let attempt = 1; attempt <= 3; attempt++) {
          setSubmitAttempt(attempt);
          try {
            const { error } = await supabase.from('guest_reports').insert({
              report_type: formData.reportType,
              latitude: selectedPosition.lat,
              longitude: selectedPosition.lng,
              location: formData.location || null,
              additional_info: formData.additionalInfo || null,
              name: formData.name || null,
              photo_url: formData.photoUrls[0] || null,
              photo_url_2: formData.photoUrls[1] || null,
              photo_url_3: formData.photoUrls[2] || null,
            });
            if (error) throw error;
            succeeded = true;
            break;
          } catch (err) {
            lastErr = err;
            if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
          }
        }
        if (succeeded) {
          setSubmitted(true);
        } else {
          // Offline queue with guest marker
          addReportToQueue({
            name: formData.name, earTag: '',
            photo: formData.photoUrls[0] || '',
            photo2: formData.photoUrls[1] || '',
            photo3: formData.photoUrls[2] || '',
            latitude: selectedPosition.lat, longitude: selectedPosition.lng,
            location: formData.location, isVaccinated: false,
            vaccination1Date: '', vaccination2Date: '',
            additionalInfo: formData.additionalInfo || '',
            reportedBy: '__guest__',
            reportType: formData.reportType,
            urgencyLevel: undefined,
            photoUrls: formData.photoUrls,
          });
          setSubmittedOffline(true);
        }
      } catch {
        setSubmittedOffline(true);
      } finally {
        setSubmitAttempt(0);
        setIsSubmitting(false);
      }
      return;
    }

    // ── LOGGED-IN USER / HELPER / ADMIN ──
    // Photos from PhotoUpload are already public Storage URLs for logged-in users.
    // No base64 stripping needed — PhotoUpload uploads immediately on selection.
    // Elevated (helper/admin): all reports auto-approved → go straight to overview
    // Regular user: only save needs manual approval
    const isAutoApproved = isElevated ? true : formData.reportType !== 'save';

    const payload = {
      name: formData.name || null,
      ear_tag: formData.earTag || null,
      photo_url: formData.photoUrls[0] || null,
      photo_url_2: formData.photoUrls[1] || null,
      photo_url_3: formData.photoUrls[2] || null,
      latitude: selectedPosition.lat,
      longitude: selectedPosition.lng,
      location: formData.location || null,
      is_vaccinated: formData.isVaccinated,
      vaccination1_date: formData.vaccination1Date || null,
      vaccination2_date: formData.vaccination2Date || null,
      additional_info: formData.additionalInfo || null,
      reported_by: user.id,
      is_approved: isAutoApproved,
      report_type: formData.reportType,
      urgency_level: null as string | null,
    };

    try {
      let succeeded = false;
      let lastErr: unknown;

      for (let attempt = 1; attempt <= 3; attempt++) {
        setSubmitAttempt(attempt);
        try {
          // INSERT without .select() — avoids SELECT RLS blocking the response
          const { error } = await supabase.from('dogs').insert(payload);
          if (error) throw error;
          succeeded = true;
          break;
        } catch (err) {
          lastErr = err;
          if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
        }
      }

      if (succeeded) {
        setSubmitted(true);
      } else {
        // Save to offline queue — syncs when connection improves
        addReportToQueue({
          name: formData.name, earTag: formData.earTag,
          photo: formData.photoUrls[0] || '',
          photo2: formData.photoUrls[1] || '',
          photo3: formData.photoUrls[2] || '',
          latitude: selectedPosition.lat, longitude: selectedPosition.lng,
          location: formData.location, isVaccinated: formData.isVaccinated,
          vaccination1Date: formData.vaccination1Date,
          vaccination2Date: formData.vaccination2Date,
          additionalInfo: formData.additionalInfo || '',
          reportedBy: user.id,
          reportType: formData.reportType,
          urgencyLevel: undefined,
          photoUrls: formData.photoUrls,
        });
        setSubmittedOffline(true);
      }
    } finally {
      setSubmitAttempt(0);
      setIsSubmitting(false);
    }
  };

  // ── SPÄTER SENDEN ────────────────────────────────────────────────────────────
  const handleSaveLater = async () => {
    if (!selectedPosition) return;
    if (!user) {
      // Guest: try direct insert, fall back silently
      try {
        await supabase.from('guest_reports').insert({
          report_type: formData.reportType,
          latitude: selectedPosition.lat,
          longitude: selectedPosition.lng,
          location: formData.location || null,
          additional_info: formData.additionalInfo || null,
          name: formData.name || null,
          photo_url: formData.photoUrls[0] || null,
          photo_url_2: formData.photoUrls[1] || null,
          photo_url_3: formData.photoUrls[2] || null,
        });
      } catch { /* silent */ }
      setSubmittedOffline(true);
    } else {
      addReportToQueue({
        name: formData.name, earTag: formData.earTag,
        photo: formData.photoUrls[0] || '',
        photo2: formData.photoUrls[1] || '',
        photo3: formData.photoUrls[2] || '',
        latitude: selectedPosition.lat, longitude: selectedPosition.lng,
        location: formData.location, isVaccinated: formData.isVaccinated,
        vaccination1Date: formData.vaccination1Date,
        vaccination2Date: formData.vaccination2Date,
        additionalInfo: formData.additionalInfo || '',
        reportedBy: user.id,
        reportType: formData.reportType,
        urgencyLevel: undefined,
        photoUrls: formData.photoUrls,
      });
      setSubmittedOffline(true);
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

  // ── SUCCESS SCREEN ───────────────────────────────────────────────────────────
  if (submitted || submittedOffline) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-lg space-y-5">
            <div className="glass-card rounded-2xl p-8 text-center animate-fade-in">
              {submittedOffline ? (
                <>
                  <WifiOff className="w-14 h-14 text-amber-500 mx-auto mb-4" />
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    {t('addDog.offlineSaved')}
                  </h2>
                  <p className="text-muted-foreground">{t('addDog.offlineMessage', { name: formData.name })}</p>
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

            {formData.reportType === 'stray' && (
              <a href={DOG_AID_URL} target="_blank" rel="noopener noreferrer"
                className="block glass-card rounded-2xl p-5 border-2 border-red-400 bg-red-50 dark:bg-red-950/30 animate-fade-in hover:border-red-500 transition-colors">
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

            <a href={FACEBOOK_GROUP} target="_blank" rel="noopener noreferrer"
              className="block glass-card rounded-2xl p-5 border border-blue-200 dark:border-blue-800 hover:border-blue-400 transition-colors animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 rounded-xl p-3 shrink-0">
                  <Facebook className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-foreground mb-0.5">{t('addDog.facebookTitle', 'Bleib informiert')}</p>
                  <p className="text-sm text-muted-foreground">{t('addDog.facebookDesc', 'Folge uns auf Facebook für Hunde-Updates aus der Region.')}</p>
                </div>
              </div>
            </a>

            <DonationSection variant="afterReport" />

            {!user && (
              <div className="glass-card rounded-2xl p-6 text-center animate-fade-in border border-primary/20">
                <p className="font-bold text-foreground mb-1">{t('addDog.registerCta', 'Möchtest du mehr mithelfen?')}</p>
                <p className="text-sm text-muted-foreground mb-4">{t('addDog.registerCtaDesc', 'Mit einem kostenlosen Konto kannst du Meldungen verfolgen und unser Team direkt unterstützen.')}</p>
                <Link to="/auth">
                  <Button className="w-full gap-2">
                    <Heart className="w-4 h-4" />
                    {t('addDog.registerCtaButton', 'Kostenlos registrieren')}
                  </Button>
                </Link>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={resetForm} className="gap-2">
                {t('addDog.anotherReport', 'Weitere Meldung')}
              </Button>
              <Button onClick={() => navigate("/")} variant="outline">
                {t('addDog.backToHome', 'Zurück zur Startseite')}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── FORM ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {t('addDog.title')}
            </h1>
            <p className="text-muted-foreground">{t('addDog.description')}</p>
          </div>

          <a href={DOG_AID_URL} target="_blank" rel="noopener noreferrer"
            className="block glass-card rounded-xl p-4 mb-6 border-2 border-red-200 dark:border-red-800 hover:border-red-400 transition-colors animate-fade-in">
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
                    <button key={type} type="button"
                      onClick={() => setFormData(prev => ({ ...prev, reportType: type }))}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.reportType === type
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}>
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
                <div className="mt-4"><DonationSection variant="compact" /></div>
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
                  <Input id="name" placeholder={t('addDog.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                {user && (
                  <div className="space-y-2">
                    <Label htmlFor="earTag" className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {t('addDog.earTag')}
                      <span className="text-xs text-muted-foreground font-normal">({t('common.optional', 'optional')})</span>
                    </Label>
                    <Input id="earTag" placeholder={t('addDog.earTagPlaceholder')}
                      value={formData.earTag}
                      onChange={(e) => setFormData(prev => ({ ...prev, earTag: e.target.value }))} />
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  {t('addDog.photo')}
                </Label>
                <PhotoUpload
                  onPhotosUploaded={(urls) => setFormData(prev => ({ ...prev, photoUrls: urls }))}
                  onUploadingChange={setIsPhotoUploading}
                  onHasPhotoChange={setHasPhoto}
                  currentPhotoUrls={formData.photoUrls}
                />
              </div>
            </div>

            {/* Location */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {t('addDog.location')}
                {!selectedPosition && <span className="text-red-500 ml-1 text-xs">{t('addDog.locationRequired', '(Pflicht)')}</span>}
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{t('addDog.locationHint')}</p>
                <SafeDogMap dogs={[]} height="300px" selectable={true} onLocationSelect={handleLocationSelect} />
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
                    <Switch id="vaccinated" checked={formData.isVaccinated}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVaccinated: checked }))} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">{t('addDog.additionalNotes')}</Label>
                  <Textarea id="additionalInfo" placeholder={t('addDog.additionalNotesPlaceholder')}
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    rows={4} />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 animate-fade-in">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1 sm:flex-none">
                {t('common.cancel')}
              </Button>
              <Button type="button" variant="outline" className="gap-2 text-muted-foreground"
                disabled={!selectedPosition || !hasPhoto || isPhotoUploading || isSubmitting}
                onClick={handleSaveLater}>
                {t('addDog.saveLater', 'Später senden')}
              </Button>
              <Button type="submit" className="flex-1 sm:flex-none gap-2"
                disabled={isSubmitting || !selectedPosition || !hasPhoto || isPhotoUploading}>
                {getReportTypeIcon(formData.reportType)}
                {isSubmitting ? t('addDog.submitting') : t('addDog.submit')}
              </Button>
            </div>

            {!hasPhoto && !isSubmitting && (
              <p className="text-xs text-center text-red-500 mt-2">
                {t('addDog.photoRequired', 'Bitte mindestens 1 Foto aufnehmen')}
              </p>
            )}
            {isPhotoUploading && (
              <p className="text-xs text-center text-primary mt-2 flex items-center justify-center gap-1.5">
                <span className="animate-spin inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full" />
                {t('addDog.uploadingPhoto', 'Foto wird hochgeladen...')}
              </p>
            )}
            {isSubmitting && submitAttempt > 1 && (
              <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-3 animate-fade-in">
                {t('addDog.slowConnection', 'Langsame Verbindung — Versuch {{attempt}} von 3...', { attempt: submitAttempt })}
              </p>
            )}
            {submitError && (
              <p className="text-xs text-center text-red-500 mt-2">{submitError}</p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddDogPage;
