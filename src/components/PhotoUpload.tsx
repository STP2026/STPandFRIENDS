import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface PhotoUploadProps {
  onPhotosUploaded: (urls: [string, string, string]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  onHasPhotoChange?: (hasPhoto: boolean) => void;
  currentPhotoUrls?: [string, string, string];
}

const compressImage = (file: File, maxWidthPx = 1200, qualityJpeg = 0.82): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidthPx) { height = Math.round((height * maxWidthPx) / width); width = maxWidthPx; }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('Compression failed')), 'image/jpeg', qualityJpeg);
    };
    img.onerror = reject;
    img.src = objectUrl;
  });

const MAX_PHOTOS = 3;

const PhotoUpload = ({ onPhotosUploaded, onUploadingChange, onHasPhotoChange, currentPhotoUrls }: PhotoUploadProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const emptyUrls: [string, string, string] = ['', '', ''];
  const [previews, setPreviews] = useState<[string, string, string]>(currentPhotoUrls ?? emptyUrls);
  const [uploading, setUploading] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [progress, setProgress] = useState<[number, number, number]>([0, 0, 0]);
  const [errors, setErrors] = useState<[string, string, string]>(['', '', '']);

  const cameraInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const galleryInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const fileInputRefs = galleryInputRefs;

  const filledCount = previews.filter(p => p && p !== '/placeholder.svg').length;

  const setSlotUploading = (slot: 0|1|2, val: boolean) => {
    setUploading(prev => { const u = [...prev] as [boolean,boolean,boolean]; u[slot] = val; return u; });
    // Notify parent if any slot is uploading
    const newState = [false, false, false] as [boolean,boolean,boolean];
    newState[slot] = val;
    onUploadingChange?.(val || uploading.some((v, i) => i !== slot && v));
  };

  const setSlotProgress = (slot: 0|1|2, val: number) => {
    setProgress(prev => { const p = [...prev] as [number,number,number]; p[slot] = val; return p; });
  };

  const uploadSlot = async (file: File, slot: 0|1|2) => {
    if (!file.type.startsWith('image/')) {
      setErrors(prev => { const e = [...prev] as [string,string,string]; e[slot] = t('photo.invalidType', 'Bitte ein Bild wählen'); return e; });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrors(prev => { const e = [...prev] as [string,string,string]; e[slot] = t('photo.tooLarge', 'Bild muss kleiner als 25MB sein'); return e; });
      return;
    }

    setErrors(prev => { const e = [...prev] as [string,string,string]; e[slot] = ''; return e; });
    setSlotUploading(slot, true);
    setSlotProgress(slot, 10);

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviews(prev => { const p = [...prev] as [string,string,string]; p[slot] = objectUrl; return p; });
    onHasPhotoChange?.(true);

    try {
      setSlotProgress(slot, 30);
      const compressed = await compressImage(file);
      setSlotProgress(slot, 55);

      const fileName = `${user?.id ?? 'guest'}/${Date.now()}-${slot}.jpg`;
      const { data, error: uploadError } = await supabase.storage
        .from('dog-photos')
        .upload(fileName, compressed, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;
      setSlotProgress(slot, 85);

      const { data: { publicUrl } } = supabase.storage.from('dog-photos').getPublicUrl(data.path);
      setSlotProgress(slot, 100);

      const newPreviews = [...previews] as [string,string,string];
      newPreviews[slot] = publicUrl;
      setPreviews(newPreviews);
      onPhotosUploaded(newPreviews);
    } catch {
      setErrors(prev => { const e = [...prev] as [string,string,string]; e[slot] = t('photo.uploadError', 'Upload fehlgeschlagen. Bitte erneut versuchen.'); return e; });
      setPreviews(prev => { const p = [...prev] as [string,string,string]; p[slot] = ''; return p; });
      onHasPhotoChange?.(previews.some((p, i) => i !== slot && !!p));
    } finally {
      setSlotUploading(slot, false);
      setTimeout(() => setSlotProgress(slot, 0), 600);
    }
  };

  const handleFileSelect = (slot: 0|1|2) => async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadSlot(file, slot);
  };

  const removePhoto = (slot: 0|1|2) => {
    const newPreviews = [...previews] as [string,string,string];
    newPreviews[slot] = '';
    setPreviews(newPreviews);
    onPhotosUploaded(newPreviews);
    if (fileInputRefs[slot].current) fileInputRefs[slot].current!.value = '';
    if (cameraInputRefs[slot].current) cameraInputRefs[slot].current!.value = '';
    onHasPhotoChange?.(newPreviews.some(p => !!p));
  };

  const isAnyUploading = uploading.some(Boolean);
  // Overall progress bar — average of active slots
  const totalProgress = isAnyUploading
    ? Math.round(progress.reduce((a, b) => a + b, 0) / uploading.filter(Boolean).length || 0)
    : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {t('photo.photos', 'Fotos')}
          <span className="text-red-500 ml-1 text-xs">{t('photo.required', '(min. 1 Pflicht)')}</span>
        </span>
        <span className="text-xs text-muted-foreground">{filledCount}/{MAX_PHOTOS}</span>
      </div>

      {/* Overall progress bar */}
      {isAnyUploading && (
        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground/80 bg-secondary/50 px-3 py-2 rounded-lg leading-relaxed">
        📸 {t('addDog.photoHint', 'Versuche, das Tier und seine besonderen Merkmale bestmöglich zu erfassen: Ohrmarke, Zeichnung, Gesicht, Auffälligkeiten ...')}
      </p>

      <div className="grid grid-cols-3 gap-2">
        {([0, 1, 2] as const).map((slot) => (
          <div key={slot} className="relative">
            {/* Hidden inputs */}
            <input ref={cameraInputRefs[slot]} type="file" accept="image/*" capture="environment" onChange={handleFileSelect(slot)} className="hidden" />
            <input ref={galleryInputRefs[slot]} type="file" accept="image/*" onChange={handleFileSelect(slot)} className="hidden" />

            {previews[slot] ? (
              <div className="relative aspect-square">
                <img src={previews[slot]} alt={`Foto ${slot + 1}`} className="w-full h-full object-cover rounded-lg border border-border" />
                {/* Per-slot progress overlay */}
                {uploading[slot] && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <div className="w-3/4 bg-secondary rounded-full h-1 overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress[slot]}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{progress[slot]}%</span>
                  </div>
                )}
                {!uploading[slot] && (
                  <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 w-6 h-6" onClick={() => removePhoto(slot)}>
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ) : (
              <div className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1.5 transition-colors
                ${(slot === 0 || previews[slot - 1])
                  ? 'border-border'
                  : 'border-border/30 opacity-40 pointer-events-none'
                }`}>
                {(slot === 0 || previews[slot - 1]) ? (
                  <>
                    <button type="button" onClick={() => cameraInputRefs[slot].current?.click()}
                      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-md hover:bg-secondary/50 transition-colors w-full">
                      <Camera className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{t('photo.camera', 'Kamera')}</span>
                    </button>
                    <div className="w-8 h-px bg-border" />
                    <button type="button" onClick={() => galleryInputRefs[slot].current?.click()}
                      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-md hover:bg-secondary/50 transition-colors w-full">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{t('photo.gallery', 'Galerie')}</span>
                    </button>
                  </>
                ) : (
                  <Plus className="w-5 h-5 text-muted-foreground/30" />
                )}
              </div>
            )}
            {errors[slot] && <p className="text-xs text-destructive mt-1">{errors[slot]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoUpload;
