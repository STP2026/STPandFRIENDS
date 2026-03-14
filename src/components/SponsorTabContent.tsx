import { useState } from 'react';
import { Heart, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Sponsor } from '@/hooks/useSponsors';

interface SponsorTabContentProps {
  sponsors: Sponsor[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

const SponsorTabContent = ({ sponsors, onAdd, onDelete }: SponsorTabContentProps) => {
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName('');
  };

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
          Sponsoren ({sponsors.length})
        </h2>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Namen werden als durchlaufender Ticker auf der Startseite angezeigt.
      </p>

      {/* Add new sponsor */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Name des Sponsors..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1"
        />
        <Button onClick={handleAdd} disabled={!newName.trim()} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Hinzufügen
        </Button>
      </div>

      {/* Sponsor list */}
      {sponsors.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground text-sm">
          Noch keine Sponsoren eingetragen.
        </p>
      ) : (
        <div className="space-y-2">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400 fill-red-400 shrink-0" />
                <span className="font-medium text-foreground">{sponsor.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => onDelete(sponsor.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      {sponsors.length > 0 && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg overflow-hidden">
          <p className="text-xs text-gray-400 mb-2">Vorschau Ticker:</p>
          <div className="flex gap-6 text-white/80 text-sm overflow-hidden">
            {sponsors.map((s) => (
              <span key={s.id} className="flex items-center gap-1.5 whitespace-nowrap">
                ❤️ {s.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorTabContent;
