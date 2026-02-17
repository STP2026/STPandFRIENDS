import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRehabSpots, useAddRehabSpot, useDeleteRehabSpot } from '@/hooks/useRehabSpots';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function RehabSpotsTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: spots, isLoading } = useRehabSpots();
  const addRehabSpot = useAddRehabSpot();
  const deleteRehabSpot = useDeleteRehabSpot();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    places_total: '1',
    available_until: '',
    contact_info: '',
    notes: '',
  });

  const handleSubmit = async () => {
    if (!user || !form.available_until || !form.contact_info) return;

    await addRehabSpot.mutateAsync({
      created_by: user.id,
      places_total: parseInt(form.places_total) || 1,
      available_until: form.available_until,
      contact_info: form.contact_info,
      notes: form.notes || null,
    });

    setForm({ places_total: '1', available_until: '', contact_info: '', notes: '' });
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('admin.rehabSpots.withdrawConfirm'))) {
      await deleteRehabSpot.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <p className="text-center text-muted-foreground">Laden...</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          {t('admin.rehabSpots.title')}
        </h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-xs sm:text-sm">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t('admin.rehabSpots.add')}</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('admin.rehabSpots.add')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="places">{t('admin.rehabSpots.placesTotal')}</Label>
                <Input
                  id="places"
                  type="number"
                  min="1"
                  value={form.places_total}
                  onChange={(e) => setForm({ ...form, places_total: e.target.value })}
                  placeholder={t('admin.rehabSpots.placesPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="until">{t('admin.rehabSpots.availableUntil')}</Label>
                <Input
                  id="until"
                  type="date"
                  value={form.available_until}
                  onChange={(e) => setForm({ ...form, available_until: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">{t('admin.rehabSpots.contactInfo')}</Label>
                <Input
                  id="contact"
                  value={form.contact_info}
                  onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
                  placeholder={t('admin.rehabSpots.contactPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t('admin.rehabSpots.notes')}</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={t('admin.rehabSpots.notesPlaceholder')}
                  className="min-h-20"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSubmit} disabled={!form.available_until || !form.contact_info} className="flex-1">
                  {addRehabSpot.isPending ? t('admin.rehabSpots.submitting') : t('admin.rehabSpots.submit')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!spots || spots.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">{t('admin.rehabSpots.noSpots')}</p>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3">
            {spots.map((spot) => (
              <div key={spot.id} className="border border-border rounded-lg p-3 bg-card">
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {spot.placesTotal} {spot.placesTotal === 1 ? 'Platz' : 'Plätze'}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      bis {new Date(spot.availableUntil).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground">{spot.contactInfo}</p>
                  {spot.notes && <p className="text-xs text-muted-foreground">{spot.notes}</p>}
                </div>
                {user?.id === spot.createdBy && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-destructive text-xs gap-1.5"
                    onClick={() => handleDelete(spot.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('admin.rehabSpots.withdraw')}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.rehabSpots.placesTotal')}</TableHead>
                  <TableHead>{t('admin.rehabSpots.availableUntil')}</TableHead>
                  <TableHead>{t('admin.rehabSpots.contactInfo')}</TableHead>
                  <TableHead>{t('admin.rehabSpots.notes')}</TableHead>
                  <TableHead className="text-right">{t('admin.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spots.map((spot) => (
                  <TableRow key={spot.id}>
                    <TableCell>
                      <Badge variant="outline">{spot.placesTotal}</Badge>
                    </TableCell>
                    <TableCell>{new Date(spot.availableUntil).toLocaleDateString('de-DE')}</TableCell>
                    <TableCell>{spot.contactInfo}</TableCell>
                    <TableCell className="max-w-xs truncate">{spot.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      {user?.id === spot.createdBy && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(spot.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
