export type FacilityType = 'vet' | 'friend';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  latitude: number;
  longitude: number;
  description: string | null;
  photoUrl: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export const FACILITY_TYPE_LABELS: Record<FacilityType, { label: string; emoji: string }> = {
  vet: { label: 'Tierarzt', emoji: '🏥' },
  friend: { label: 'PawFriend', emoji: '🏠' },
};
