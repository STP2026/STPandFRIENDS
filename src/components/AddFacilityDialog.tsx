import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useAddFacility } from '@/hooks/useFacilities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PhotoUpload from '@/components/PhotoUpload';
import DogMap from '@/components/DogMap';
import { Plus, MapPin, Building2, Stethoscope, Home, Phone, Globe, Image } from 'lucide-react';
import { FacilityType, FACILITY_TYPE_LABELS } from '@/types/facility';
import { toast } from 'sonner';

interface AddFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddFacilityDialog({ open, onOpenChange }: AddFacilityDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const addFacility = useAddFacility();

  const [name, setName] = useState('');
  const [type, setType] = useState<FacilityType>('vet');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);

  const handleLocationSelect = useRef((lat: number, lng: number) => {
    setLocation({ lat, lng });
  }).current;

  const handleSubmit = async () => {
    if (!name.trim() || !location || !user) {
      toast.error('Bitte Name und Standort angeben');
      return;
    }

    try {
      await addFacility.mutateAsync({
        name: name.trim(),
        type,
        latitude: location.lat,
        longitude: location.lng,
        description: description.trim() || null,
        address: address.trim() || null,
        phone: phone.trim() || null,
        website: website.trim() || null,
        photo_url: photoUrl,
        created_by: user.id,
      });

      toast.success('Einrichtung erfolgreich hinzugefügt!');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding facility:', error);
      toast.error('Fehler beim Hinzufügen der Einrichtung');
    }
  };

  const resetForm = () => {
    setName('');
    setType('vet');
    setDescription('');
    setAddress('');
    setPhone('');
    setWebsite('');
    setPhotoUrl(null);
    setLocation(null);
    setShowMap(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Einrichtung hinzufügen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Typ</Label>
            <Select value={type} onValueChange={(v) => setType(v as FacilityType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vet">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-destructive" />
                    Tierarzt (Vet)
                  </div>
                </SelectItem>
                <SelectItem value="friend">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-primary" />
                    Partner (Friends) - Hotels, Shops
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'vet' ? 'z.B. Dr. Vet Clinic' : 'z.B. Dog-Friendly Hotel'}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Zusätzliche Informationen..."
              rows={3}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Adresse
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Straße, PLZ, Ort"
            />
          </div>

          {/* Phone & Website */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefon
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+212 ..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Photo */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Foto
            </Label>
            <PhotoUpload
              onPhotoUploaded={setPhotoUrl}
              currentPhotoUrl={photoUrl || undefined}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Standort auf Karte * 
              {location && (
                <span className="text-sm text-muted-foreground">
                  ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
                </span>
              )}
            </Label>
            {!showMap ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMap(true)}
                className="w-full gap-2"
              >
                <MapPin className="w-4 h-4" />
                Standort auf Karte wählen
              </Button>
            ) : (
              <div className="space-y-2">
                <DogMap
                  dogs={[]}
                  height="300px"
                  selectable
                  onLocationSelect={handleLocationSelect}
                  zoom={12}
                />
                {location && (
                  <p className="text-sm text-safe flex items-center gap-1">
                    ✓ Standort gewählt
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!name.trim() || !location || addFacility.isPending}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Hinzufügen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
