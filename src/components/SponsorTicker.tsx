import { useSponsors } from '@/hooks/useSponsors';
import { useTranslation } from 'react-i18next';

const SponsorTicker = () => {
  const { t } = useTranslation();
  const { data: sponsors = [] } = useSponsors();

  if (sponsors.length === 0) return null;

  const items = [...sponsors, ...sponsors];

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-center gap-2 mb-0.5">
        <span className="text-white/70 text-xs uppercase tracking-widest shrink-0">
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
              className="inline-flex items-center gap-1.5 text-white text-sm font-medium"
            >
              <span>❤️</span>
              {sponsor.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SponsorTicker;
