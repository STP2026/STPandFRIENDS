import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoLightboxProps {
  photos: string[];          // Array of photo URLs (non-empty strings only)
  initialIndex?: number;
  onClose: () => void;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const PhotoLightbox = ({ photos, onClose, currentIndex, onIndexChange }: PhotoLightboxProps) => {
  const total = photos.length;

  const prev = useCallback(() => {
    onIndexChange((currentIndex - 1 + total) % total);
  }, [currentIndex, total, onIndexChange]);

  const next = useCallback(() => {
    onIndexChange((currentIndex + 1) % total);
  }, [currentIndex, total, onIndexChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && total > 1) prev();
      if (e.key === 'ArrowRight' && total > 1) next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, prev, next, total]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 rounded-full p-2 z-10"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev button */}
      {total > 1 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 rounded-full p-3 z-10"
          onClick={(e) => { e.stopPropagation(); prev(); }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <img
        src={photos[currentIndex]}
        alt={`Foto ${currentIndex + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next button */}
      {total > 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 rounded-full p-3 z-10"
          onClick={(e) => { e.stopPropagation(); next(); }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); onIndexChange(i); }}
              className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {total > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full">
          {currentIndex + 1} / {total}
        </div>
      )}
    </div>
  );
};

export default PhotoLightbox;
