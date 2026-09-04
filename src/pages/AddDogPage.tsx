import { useState, useEffect } from "react";
import Header from "@/components/Header";
import DonationSection from "@/components/DonationSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dog, Camera, MapPin, Tag, FileText, CheckCircle, Heart, Syringe, WifiOff, Facebook, ExternalLink, Mail, Scale } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, Link } from "react-router-dom";
import SafeDogMap from "@/components/SafeDogMap";
import PhotoUpload from "@/components/PhotoUpload";
import { uploadBase64ToStorage } from "@/lib/photoStorage";
import { useAuth } from "@/contexts/AuthContext";
import { useIsHelper } from "@/hooks/useHelperApplication";
import { useOfflineContext } from "@/contexts/OfflineContext";
import { supabase } from "@/integrations/supabase/client";
import { ensureValidSession } from "@/lib/sessionGuard";
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
  const { addReportToQueue, isOnline } = useOfflineContext();

  const [submitted, setSubmitted] = useState(false);
  const [submittedOffline, setSubmittedOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // H8: Guest rate limiting — 2 min cooldown between reports
  const GUEST_COOLDOWN_MS = 2 * 60 * 1000;
  const GUEST_COOLDOWN_KEY = 'stp_guest_last_report';
  const getGuestCooldownRemaining = (): number => {
    if (user) return 0;
    try {
      const last = localStorage.getItem(GUEST_COOLDOWN_KEY);
      if (!last) return 0;
      const remaining = GUEST_COOLDOWN_MS - (Date.now() - parseInt(last));
      return remaining > 0 ? remaining : 0;
    } catch { return 0; }
  };
  const [guestCooldown, setGuestCooldown] = useState(getGuestCooldownRemaining);

  // Tick down cooldown every second when active
  useEffect(() => {
    if (user || guestCooldown <= 0) return;
    const interval = setInterval(() => {
      const remaining = getGuestCooldownRemaining();
      setGuestCooldown(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [guestCooldown > 0]); // eslint-disable-line

  const [formData, setFormData] = useState({
    name: "",
    earTag: "",
    photoUrls: ["", "", ""] as [string, string, string],
    photoBase64: ["", "", ""] as [string, string, string],
    location: "",
    isVaccinated: false,
    vaccination1Date: "",
    vaccination2Date: "",
    additionalInfo: "",
    reportType: "stray" as ReportType,
    urgencyLevel: "",
    gender: "" as "" | "male" | "female",
    reportedByName: "",
    reporterEmail: "",
  });
  const [consentGiven, setConsentGiven] = useState(false);

  // Prefill sender email from account for logged-in users
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => (prev.reporterEmail ? prev : { ...prev, reporterEmail: user.email! }));
    }
  }, [user?.email]);

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
      photoBase64: ["", "", ""] as [string, string, string],
      location: "", isVaccinated: false,
      vaccination1Date: "", vaccination2Date: "",
      additionalInfo: "", reportType: "stray", urgencyLevel: "",
      gender: "", reportedByName: "",
      reporterEmail: user?.email || "",
    });
    setConsentGiven(false);
  };

  // ── Sender validation — required for ALL reports (guest + logged-in) ──
  const validateSender = (): boolean => {
    if (!formData.reportedByName.trim()) {
      setSubmitError(t('addDog.nameRequired', 'Bitte gib deinen Namen an.'));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.reporterEmail.trim())) {
      setSubmitError(t('addDog.emailInvalid', 'Bitte gib eine gültige E-Mail-Adresse an.'));
      return false;
    }
    if (!consentGiven) {
      setSubmitError(t('addDog.consentRequired', 'Bitte stimme der Speicherung deiner Kontaktdaten zu.'));
      return false;
    }
    return true;
  };

  // ── Build queue payload — reusable for submit + saveLater ──
  const buildQueuePayload = () => {
    if (!selectedPosition) return null;
    const isAutoApproved = isElevated ? true : formData.reportType !== 'save';
    return {
      name: formData.name,
      earTag: formData.earTag,
      photo: formData.photoUrls[0] || '',
      photo2: formData.photoUrls[1] || '',
      photo3: formData.photoUrls[2] || '',
      latitude: selectedPosition.lat,
      longitude: selectedPosition.lng,
      location: formData.location,
      isVaccinated: formData.isVaccinated,
      vaccination1Date: formData.vaccination1Date,
      vaccination2Date: formData.vaccination2Date,
      additionalInfo: formData.additionalInfo || '',
      reportedBy: user?.id || '__guest__',
      reportType: formData.reportType,
      urgencyLevel: undefined as string | undefined,
      gender: formData.gender || undefined,
      reportedByName: formData.reportedByName.trim() || undefined,
      reporterEmail: formData.reporterEmail.trim() || undefined,
      isAutoApproved,
      photoBase64: formData.photoBase64 as [string, string, string],
    };
  };

  /**
   * Resolve photo URLs for DB insert.
   * If photos are already Storage URLs → use them directly.
   * If photos are base64 (offline capture while online) → upload to Storage first.
   * Returns [url1, url2, url3] ready for the dogs table.
   */
  const resolvePhotoUrls = async (): Promise<[string, string, string]> => {
    const urls = [...formData.photoUrls] as [string, string, string];
    if (!user?.id) return urls;

    for (let i = 0; i < 3; i++) {
      const b64 = formData.photoBase64[i];
      if (b64 && b64.startsWith('data:')) {
        const publicUrl = await uploadBase64ToStorage(b64, user.id, i);
        if (publicUrl) {
          urls[i] = publicUrl;
        }
      }
    }
    return urls;
  };

  // ── SUBMIT ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPosition) return;
    setSubmitError(null);
    if (!validateSender()) return;
    setIsSubmitting(true);

    // ── GUEST ──
    if (!user) {
      // Rate limiting: check cooldown
      const cooldownLeft = getGuestCooldownRemaining();
      if (cooldownLeft > 0) {
        setSubmitError(t('addDog.cooldownActive', 'Bitte warte {{seconds}}s bevor du erneut meldest.', { seconds: Math.ceil(cooldownLeft / 1000) }));
        setIsSubmitting(false);
        return;
      }

      try {
        let succeeded = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          setSubmitAttempt(attempt);
          try {
            const photoUrl = formData.photoBase64[0] || formData.photoUrls[0] || null;
            const photoUrl2 = formData.photoBase64[1] || formData.photoUrls[1] || null;
            const photoUrl3 = formData.photoBase64[2] || formData.photoUrls[2] || null;

            const { error } = await supabase.from('guest_reports').insert({
              report_type: formData.reportType,
              latitude: selectedPosition.lat,
              longitude: selectedPosition.lng,
              location: formData.location || null,
              additional_info: formData.additionalInfo || null,
              name: formData.name || null,
              ear_tag: formData.earTag || null,
              photo_url: photoUrl,
              photo_url_2: photoUrl2,
              photo_url_3: photoUrl3,
              gender: formData.gender || null,
              reported_by_name: formData.reportedByName.trim() || null,
              reporter_email: formData.reporterEmail.trim() || null,
              reported_at: new Date().toISOString(),
            });
            if (error) throw error;
            succeeded = true;
            break;
          } catch {
            if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
          }
        }
        if (succeeded) {
          // Stamp cooldown
          try { localStorage.setItem(GUEST_COOLDOWN_KEY, Date.now().toString()); } catch {}
          setGuestCooldown(GUEST_COOLDOWN_MS);
          setSubmitted(true);
        } else {
          const payload = buildQueuePayload();
          if (payload) addReportToQueue(payload);
          setSubmittedOffline(true);
        }
      } catch {
        const payload = buildQueuePayload();
        if (payload) addReportToQueue(payload);
        setSubmittedOffline(true);
      } finally {
        setSubmitAttempt(0);
        setIsSubmitting(false);
      }
      return;
    }

    // ── LOGGED-IN USER / HELPER / ADMIN ──
    const isAutoApproved = isElevated ? true : formData.reportType !== 'save';

    try {
      // Ensure JWT is valid before writing
      const sessionOk = await ensureValidSession();
      if (!sessionOk) {
        const queueData = buildQueuePayload();
        if (queueData) addReportToQueue(queueData);
        setSubmittedOffline(true);
        return;
      }

      // Resolve photos: upload any base64 to Storage first
      const photoUrls = await resolvePhotoUrls();

      const payload = {
        name: formData.name || null,
        ear_tag: formData.earTag || null,
        photo_url: photoUrls[0] || null,
        photo_url_2: photoUrls[1] || null,
        photo_url_3: photoUrls[2] || null,
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
        gender: formData.gender || null,
        reported_by_name: formData.reportedByName.trim() || null,
        reporter_email: formData.reporterEmail.trim() || null,
        reported_at: new Date().toISOString(),
      };

      let succeeded = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        setSubmitAttempt(attempt);
        try {
          const { error } = await supabase.from('dogs').insert(payload);
          if (error) throw error;
          succeeded = true;
          break;
        } catch {
          if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
        }
      }

      if (succeeded) {
        setSubmitted(true);
      } else {
        const queueData = buildQueuePayload();
        if (queueData) addReportToQueue(queueData);
        setSubmittedOffline(true);
      }
    } finally {
      setSubmitAttempt(0);
      setIsSubmitting(false);
    }
  };

  // ── SPÄTER SENDEN ────────────────────────────────────────────────────────────
  const handleSaveLater = () => {
    if (!selectedPosition) return;
    setSubmitError(null);
    if (!validateSender()) return;
    const queueData = buildQueuePayload();
    if (queueData) addReportToQueue(queueData);
    setSubmittedOffline(true);
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

          {/* Law 19.25 notice — permanent on report page (v100) */}
          <div className="glass-card rounded-xl p-4 mb-6 border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 animate-fade-in">
            <div className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">
                  {t('lawNotice.title', 'Wichtiger rechtlicher Hinweis')}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('lawNotice.body', 'Seit August 2026 gilt in Marokko das Gesetz Nr. 19.25 zum Umgang mit streunenden Tieren. Artikel 5 untersagt Privatpersonen das Füttern, Unterbringen und Behandeln von Straßentieren ohne behördliche Genehmigung (Geldbußen 1.500–3.000 MAD). Die Versorgung soll über kommunale Zentren erfolgen. Bitte informiere dich über die aktuelle Rechtslage und entscheide eigenverantwortlich, wie du helfen möchtest.')}
                </p>
              </div>
            </div>
          </div>

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
              </div>
              <div className="mt-4 space-y-2">
                <Label>{t('addDog.gender', 'Geschlecht')} <span className="text-xs text-muted-foreground font-normal">({t('common.optional', 'optional')})</span></Label>
                <div className="flex gap-2">
                  {([['', '—'], ['male', '♂ ' + t('addDog.genderMale', 'Männlich')], ['female', '♀ ' + t('addDog.genderFemale', 'Weiblich')]] as [string, string][]).map(([val, label]) => (
                    <button key={val} type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: val as '' | 'male' | 'female' }))}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.gender === val ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
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
                  onBase64Change={(b64s) => setFormData(prev => ({ ...prev, photoBase64: b64s }))}
                  isOnline={isOnline}
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

            {/* Sender contact — required for all reports (v100) */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                {t('addDog.senderTitle', 'Deine Kontaktdaten')}
                <span className="text-red-500 text-xs font-normal">{t('addDog.locationRequired', '(Pflicht)')}</span>
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                {t('addDog.senderHint', 'Damit unser Team dich bei Rückfragen zu deiner Meldung erreichen kann.')}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportedByName">{t('addDog.reportedByName', 'Gemeldet von')}</Label>
                  <Input id="reportedByName" required autoComplete="name"
                    placeholder={t('addDog.reportedByNamePlaceholder', 'Dein Name (z.B. für Touristen-Meldungen)')}
                    value={formData.reportedByName}
                    onChange={(e) => setFormData(prev => ({ ...prev, reportedByName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reporterEmail">{t('addDog.reporterEmail', 'E-Mail-Adresse')}</Label>
                  <Input id="reporterEmail" type="email" required autoComplete="email" dir="ltr"
                    placeholder={t('addDog.reporterEmailPlaceholder', 'deine@email.de')}
                    value={formData.reporterEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, reporterEmail: e.target.value }))} />
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                <Checkbox id="senderConsent" checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(checked === true)}
                  className="mt-0.5" />
                <Label htmlFor="senderConsent" className="text-xs text-muted-foreground font-normal cursor-pointer leading-relaxed">
                  {t('addDog.consentLabel', 'Ich stimme zu, dass mein Name und meine E-Mail-Adresse zur Bearbeitung dieser Meldung gespeichert werden.')}{' '}
                  <Link to="/privacy" className="underline text-primary hover:text-primary/80" target="_blank">
                    {t('privacy.learnMore', 'Mehr erfahren')}
                  </Link>
                </Label>
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
