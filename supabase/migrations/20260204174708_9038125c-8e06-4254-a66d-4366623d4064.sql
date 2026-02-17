-- Create rehab_spots table for post-castration recovery places
CREATE TABLE public.rehab_spots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  places_total INTEGER NOT NULL DEFAULT 1,
  available_until DATE NOT NULL,
  contact_info TEXT NOT NULL,
  notes TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rehab_spots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Helpers and admins can view all active spots
CREATE POLICY "Helpers can view rehab spots"
ON public.rehab_spots
FOR SELECT
USING (is_helper_or_admin(auth.uid()));

-- Helpers and admins can create spots (created_by must be their own id)
CREATE POLICY "Helpers can create rehab spots"
ON public.rehab_spots
FOR INSERT
WITH CHECK (is_helper_or_admin(auth.uid()) AND auth.uid() = created_by);

-- Creators can update their own spots
CREATE POLICY "Creators can update own rehab spots"
ON public.rehab_spots
FOR UPDATE
USING (auth.uid() = created_by);

-- Creators can delete their own spots (withdraw offer)
CREATE POLICY "Creators can delete own rehab spots"
ON public.rehab_spots
FOR DELETE
USING (auth.uid() = created_by);

-- Admins can delete any spot
CREATE POLICY "Admins can delete any rehab spot"
ON public.rehab_spots
FOR DELETE
USING (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_rehab_spots_updated_at
  BEFORE UPDATE ON public.rehab_spots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();