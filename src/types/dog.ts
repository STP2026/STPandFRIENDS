export type ReportType = 'save' | 'sos' | 'stray' | 'vaccination_wish';

export interface Dog {
  id: string;
  name: string;
  earTag: string;
  photo: string;
  photo2?: string | null;
  photo3?: string | null;
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
  caretaker?: string | null;
  gender?: string | null;
}

export interface DogFormData {
  name: string;
  earTag: string;
  photo: string;
  photo2?: string;
  photo3?: string;
  latitude: number;
  longitude: number;
  location: string;
  isVaccinated: boolean;
  vaccination1Date?: string;
  vaccination2Date?: string;
  additionalInfo?: string;
  reportType: ReportType;
  urgencyLevel?: string;
  gender?: string;
  /** Pre-computed at submit time so offline sync doesn't lose role context */
  isAutoApproved?: boolean;
  /**
   * Base64 data URLs for photos captured while offline.
   * When syncing, these are uploaded to Storage first, then replaced with public URLs.
   * Index 0/1/2 correspond to photo/photo2/photo3.
   */
  photoBase64?: [string, string, string];
}

export interface DbDog {
  id: string;
  name: string;
  ear_tag: string;
  photo_url: string | null;
  photo_url_2: string | null;
  photo_url_3: string | null;
  latitude: number;
  longitude: number;
  location: string | null;
  is_vaccinated: boolean;
  vaccination1_date: string | null;
  vaccination2_date: string | null;
  vaccination_passport: string | null;
  additional_info: string | null;
  is_approved: boolean | null;
  reported_by?: string | null;
  reporter_name?: string | null;
  created_at: string;
  updated_at: string;
  report_type: ReportType;
  urgency_level: string | null;
  sponsor_name: string | null;
  caretaker: string | null;
  gender?: string | null;
}

export function mapDbDogToDog(dbDog: DbDog): Dog {
  return {
    id: dbDog.id,
    name: dbDog.name,
    earTag: dbDog.ear_tag,
    photo: dbDog.photo_url || '/placeholder.svg',
    photo2: dbDog.photo_url_2 || null,
    photo3: dbDog.photo_url_3 || null,
    latitude: dbDog.latitude,
    longitude: dbDog.longitude,
    location: dbDog.location || '',
    isVaccinated: dbDog.is_vaccinated,
    vaccination1Date: dbDog.vaccination1_date,
    vaccination2Date: dbDog.vaccination2_date,
    vaccinationPassport: dbDog.vaccination_passport,
    additionalInfo: dbDog.additional_info || undefined,
    isApproved: dbDog.is_approved ?? false,
    reporterName: dbDog.reporter_name || undefined,
    createdAt: dbDog.created_at,
    updatedAt: dbDog.updated_at,
    reportType: dbDog.report_type,
    urgencyLevel: dbDog.urgency_level,
    sponsorName: dbDog.sponsor_name,
    caretaker: dbDog.caretaker,
    gender: dbDog.gender || null,
  };
}

export const REPORT_TYPE_LABELS: Record<ReportType, { label: string; emoji: string; color: string }> = {
  save: { label: 'Tagged', emoji: '✅', color: 'bg-green-500' },
  sos: { label: 'Attention', emoji: '🚨', color: 'bg-red-500' },
  stray: { label: 'Report a Stray', emoji: '🐕', color: 'bg-amber-500' },
  vaccination_wish: { label: 'Sponsor & Watch', emoji: '❤️', color: 'bg-blue-500' },
};

/** Report types available to regular users (no SOS — that's admin/helper only) */
export const USER_REPORT_TYPES: ReportType[] = ['save', 'stray', 'vaccination_wish'];

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
