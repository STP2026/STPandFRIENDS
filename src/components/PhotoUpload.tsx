import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PhotoUploadProps {
  onPhotoUploaded: (url: string) => void;
  currentPhotoUrl?: string;
}

// Compress image client-side before upload
// Reduces a 5MB phone photo to ~300KB — faster upload, less storage cost
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

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load failed'));
    };

    img.src = objectUrl;
  });
};

const PhotoUpload = ({ onPhotoUploaded, currentPhotoUrl }: PhotoUploadProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Bitte wähle ein Bild aus');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Das Bild darf maximal 5MB groß sein');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create preview immediately from original file
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Compress before upload: ~5MB phone photo → ~300KB
      const compressed = await compressImage(file);
      const compressedFile = new File([compressed], `photo.jpg`, { type: 'image/jpeg' });

      // Generate unique filename
      const fileName = `${user?.id}/${Date.now()}.jpg`;

      // Upload compressed image to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('dog-photos')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('dog-photos')
        .getPublicUrl(data.path);

      onPhotoUploaded(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Fehler beim Hochladen. Bitte versuche es erneut.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onPhotoUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Hidden file input with camera/gallery access */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Vorschau"
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          {!isUploading && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemovePhoto}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors"
        >
          <div className="flex gap-2">
            <Camera className="w-8 h-8 text-muted-foreground" />
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Foto aufnehmen oder hochladen</p>
            <p className="text-xs text-muted-foreground">Tippe hier, um ein Foto auszuwählen</p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!previewUrl && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2"
            onClick={triggerFileInput}
          >
            <Camera className="w-4 h-4" />
            Kamera
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.click();
                // Restore capture attribute after click
                setTimeout(() => {
                  fileInputRef.current?.setAttribute('capture', 'environment');
                }, 100);
              }
            }}
          >
            <Upload className="w-4 h-4" />
            Galerie
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
