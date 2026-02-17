import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useActiveAdvertisement } from '@/hooks/useAdvertisements';

const AD_SHOWN_KEY = 'ad_popup_shown_session';

const AdPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: ad, isLoading } = useActiveAdvertisement();

  useEffect(() => {
    // Only show ad once per session
    if (sessionStorage.getItem(AD_SHOWN_KEY)) {
      return;
    }

    if (isLoading || !ad) {
      return;
    }

    const delayMs = (ad.display_delay_seconds || 20) * 1000;
    
    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem(AD_SHOWN_KEY, 'true');
    }, delayMs);

    return () => clearTimeout(timer);
  }, [ad, isLoading]);

  if (!ad) {
    return null;
  }

  const handleVisit = () => {
    window.open(ad.target_url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">{ad.title}</DialogTitle>
        
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Ad Content */}
        <div className="cursor-pointer" onClick={handleVisit}>
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-auto object-cover"
          />
          
          <div className="p-4 bg-gradient-to-t from-background to-background/80">
            <h3 className="font-display text-lg font-bold text-foreground mb-2">
              {ad.title}
            </h3>
            <Button className="w-full gap-2" onClick={handleVisit}>
              <ExternalLink className="w-4 h-4" />
              Besuchen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdPopup;
