import { useSponsors } from '@/hooks/useSponsors';
import { useTranslation } from 'react-i18next';

const SponsorTicker = () => {
  const { t } = useTranslation();
  const { data: sponsors = [] } = useSponsors();

  if (sponsors.length === 0) return null;

  // Duplicate list for seamless loop
  const items = [...sponsors, ...sponsors];

  return (
    <div className="w-full overflow-hidden bg-white/10 backdrop-blur-sm border-t border-white/10 py-2 mt-4">
      <div className="flex items-center gap-2 mb-0.5 justify-center">
        <span className="text-white/50 text-xs uppercase tracking-widest shrink-0">
          {t('sponsors.label', 'Unsere Sponsoren')}
        </span>
      </div>
      <div className="relative overflow-hidden">
        <div
          className="flex gap-8 whitespace-nowrap"
          style={{
            animation: 'ticker-scroll 30s linear infinite',
            width: 'max-content',
          }}
        >
          {items.map((sponsor, i) => (
            <span
              key={`${sponsor.id}-${i}`}
              className="inline-flex items-center gap-1.5 text-white/80 text-sm font-medium"
            >
              <span className="text-red-400">❤️</span>
              {sponsor.name}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default SponsorTicker;
