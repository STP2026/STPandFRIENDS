import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface PhotoUploadProps {
  onPhotosUploaded: (urls: [string, string, string]) => void;
  currentPhotoUrls?: [string, string, string];
}

// Compress image client-side before upload
const compressImage = (file: File, maxWidthPx = 1200, qualityJpeg = 0.82): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidthPx) {
        height = Math.round((height * maxWidthPx) / width);
        width = maxWidthPx;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/jpeg',
        qualityJpeg
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
    img.src = objectUrl;
  });
};

const MAX_PHOTOS = 3;

const PhotoUpload = ({ onPhotosUploaded, currentPhotoUrls }: PhotoUploadProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [previews, setPreviews] = useState<[string, string, string]>(
    currentPhotoUrls ?? ['', '', '']
  );
  const [uploading, setUploading] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [errors, setErrors] = useState<[string, string, string]>(['', '', '']);
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const uploadSlot = async (file: File, slot: 0 | 1 | 2) => {
    if (!file.type.startsWith('image/')) {
      setErrors(prev => { const e = [...prev] as [string,string,string]; e[slot] = t('photo.invalidType', 'Please select an image'); return e; });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrors(prev => { const e = [...prev] as [string,string,string]; e[slot] = t('photo.tooLarge', 'Image must be smaller than 25MB'); return e; });
      return;
    }
    setErrors(prev => { const e = [...prev] as [string,string,string]; e[slot] = ''; return e; });
    setUploading(prev => { const u = [...prev] as [boolean,boolean,boolean]; u[slot] = true; return u; });

    const objectUrl = URL.createObjectURL(file);
    setPreviews(prev => { const p = [...prev] as [string,string,string]; p[slot] = objectUrl; return p; });

    try {
      const compressed = await compressImage(file);
      const compressedFile = new File([compressed], `photo.jpg`, { type: 'image/jpeg' });
      const fileName = `${user?.id}/${Date.now()}-${slot}.jpg`;

      const { data, error: uploadError } = await supabase.storage
        .from('dog-photos')
        .upload(fileName, compressedFile, { cacheControl: '3600', upsert: false, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('dog-photos').getPublicUrl(data.path);

      const newPreviews = [...previews] as [string,string,string];
      newPreviews[slot] = publicUrl;
      setPreviews(newPreviews);
      onPhotosUploaded(newPreviews);
    } catch (err) {
      console.error('Upload error:', err);
      setErrors(prev => { const e = [...prev] as [string,string,string]; e[slot] = t('photo.uploadError', 'Upload failed. Please try again.'); return e; });
      setPreviews(prev => { const p = [...prev] as [string,string,string]; p[slot] = ''; return p; });
    } finally {
      setUploading(prev => { const u = [...prev] as [boolean,boolean,boolean]; u[slot] = false; return u; });
    }
  };

  const handleFileSelect = (slot: 0 | 1 | 2) => async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadSlot(file, slot);
  };

  const removePhoto = (slot: 0 | 1 | 2) => {
    const newPreviews = [...previews] as [string,string,string];
    newPreviews[slot] = '';
    setPreviews(newPreviews);
    onPhotosUploaded(newPreviews);
    if (fileInputRefs[slot].current) fileInputRefs[slot].current!.value = '';
  };

  // Count filled slots
  const filledCount = previews.filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {t('photo.photos', 'Photos')}
        </span>
        <span className="text-xs text-muted-foreground">
          {filledCount}/{MAX_PHOTOS}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {([0, 1, 2] as const).map((slot) => (
          <div key={slot} className="relative">
            {/* Hidden file input */}
            <input
              ref={fileInputRefs[slot]}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect(slot)}
              className="hidden"
            />

            {previews[slot] ? (
              <div className="relative aspect-square">
                <img
                  src={previews[slot]}
                  alt={`Foto ${slot + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-border"
                />
                {uploading[slot] && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
                {!uploading[slot] && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 w-6 h-6"
                    onClick={() => removePhoto(slot)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ) : (
              <div
                onClick={() => {
                  // Only allow adding if previous slots are filled (sequential)
                  if (slot === 0 || previews[slot - 1]) {
                    fileInputRefs[slot].current?.click();
                  }
                }}
                className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 transition-colors
                  ${(slot === 0 || previews[slot - 1])
                    ? 'border-border hover:border-primary/50 hover:bg-secondary/30 cursor-pointer'
                    : 'border-border/30 opacity-40 cursor-not-allowed'
                  }`}
              >
                {slot === 0 ? (
                  <>
                    <Camera className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center leading-tight px-1">
                      {t('photo.takeOrUpload', 'Photo')}
                    </span>
                  </>
                ) : (
                  <Plus className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            )}

            {errors[slot] && (
              <p className="text-xs text-destructive mt-1">{errors[slot]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Camera / Gallery buttons for slot 0 when empty */}
      {!previews[0] && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => fileInputRefs[0].current?.click()}
          >
            <Camera className="w-4 h-4" />
            {t('photo.camera', 'Camera')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => {
              if (fileInputRefs[0].current) {
                fileInputRefs[0].current.removeAttribute('capture');
                fileInputRefs[0].current.click();
                setTimeout(() => fileInputRefs[0].current?.setAttribute('capture', 'environment'), 100);
              }
            }}
          >
            <Upload className="w-4 h-4" />
            {t('photo.gallery', 'Gallery')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
