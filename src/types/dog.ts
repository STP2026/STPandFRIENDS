export type ReportType = 'save' | 'sos' | 'stray' | 'vaccination_wish';

export interface Dog {
  id: string;
  name: string;
  earTag: string;
  photo: string;
  latitude: number;
  longitude: number;
  location: string;
  isVaccinated: boolean;
  vaccination1Date?: string | null;
  vaccination2Date?: string | null;
  vaccinationPassport?: string | null;
  additionalInfo?: string;
  isApproved: boolean;
  reporterName?: string;
  createdAt: string;
  updatedAt: string;
  reportType: ReportType;
  urgencyLevel?: string | null;
  sponsorName?: string | null;
}

export interface DogFormData {
  name: string;
  earTag: string;
  photo: string;
  latitude: number;
  longitude: number;
  location: string;
  isVaccinated: boolean;
  vaccination1Date?: string;
  vaccination2Date?: string;
  additionalInfo?: string;
  reportType: ReportType;
  urgencyLevel?: string;
}

export interface DbDog {
  id: string;
  name: string;
  ear_tag: string;
  photo_url: string | null;
  latitude: number;
  longitude: number;
  location: string | null;
  is_vaccinated: boolean;
  vaccination1_date: string | null;
  vaccination2_date: string | null;
  vaccination_passport: string | null;
  additional_info: string | null;
  is_approved: boolean;
  reported_by?: string | null;
  reporter_name?: string | null;
  created_at: string;
  updated_at: string;
  report_type: ReportType;
  urgency_level: string | null;
  sponsor_name: string | null;
}

export function mapDbDogToDog(dbDog: DbDog): Dog {
  return {
    id: dbDog.id,
    name: dbDog.name,
    earTag: dbDog.ear_tag,
    photo: dbDog.photo_url || '/placeholder.svg',
    latitude: dbDog.latitude,
    longitude: dbDog.longitude,
    location: dbDog.location || '',
    isVaccinated: dbDog.is_vaccinated,
    vaccination1Date: dbDog.vaccination1_date,
    vaccination2Date: dbDog.vaccination2_date,
    vaccinationPassport: dbDog.vaccination_passport,
    additionalInfo: dbDog.additional_info || undefined,
    isApproved: dbDog.is_approved,
    reporterName: dbDog.reporter_name || undefined,
    createdAt: dbDog.created_at,
    updatedAt: dbDog.updated_at,
    reportType: dbDog.report_type,
    urgencyLevel: dbDog.urgency_level,
    sponsorName: dbDog.sponsor_name,
  };
}

export const REPORT_TYPE_LABELS: Record<ReportType, { label: string; emoji: string; color: string; description: string }> = {
  save: { label: 'Tagged', emoji: '✅', color: 'bg-green-500', description: 'Geimpft, kastriert, mit Ohrmarke' },
  sos: { label: 'SOS', emoji: '🚨', color: 'bg-red-500', description: 'Verletztes Tier melden' },
  stray: { label: 'Report a Stray', emoji: '🐕', color: 'bg-amber-500', description: 'Hund ohne Ohrmarke melden' },
  vaccination_wish: { label: 'Promote', emoji: '💉', color: 'bg-blue-500', description: 'Bitte impfen & kastrieren' },
};

export interface HelperApplication {
  id: string;
  userId: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbHelperApplication {
  id: string;
  user_id: string;
  message: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function mapDbHelperApplication(db: DbHelperApplication): HelperApplication {
  return {
    id: db.id,
    userId: db.user_id,
    message: db.message,
    status: db.status as 'pending' | 'approved' | 'rejected',
    reviewedBy: db.reviewed_by,
    reviewedAt: db.reviewed_at,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}
