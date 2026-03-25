import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads a base64 data URL to Supabase Storage.
 * Used during offline queue sync and guest report conversion
 * to convert locally cached photos to public URLs.
 *
 * Extracted into its own module to avoid circular dependency
 * between PhotoUpload (which uses OfflineContext) and
 * OfflineContext (which needs this upload function).
 */
export async function uploadBase64ToStorage(
  base64DataUrl: string,
  userId: string,
  slot: number
): Promise<string | null> {
  try {
    const res = await fetch(base64DataUrl);
    const blob = await res.blob();
    const fileName = `${userId}/${Date.now()}-${slot}.jpg`;
    const { data, error } = await supabase.storage
      .from('dog-photos')
      .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('dog-photos').getPublicUrl(data.path);
    return publicUrl;
  } catch {
    return null;
  }
}
