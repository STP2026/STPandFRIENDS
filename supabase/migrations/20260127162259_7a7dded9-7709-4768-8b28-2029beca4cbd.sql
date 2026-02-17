-- Create enum for facility types
CREATE TYPE public.facility_type AS ENUM ('vet', 'friend');

-- Create facilities table
CREATE TABLE public.facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type facility_type NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  description TEXT,
  photo_url TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all facilities
CREATE POLICY "Authenticated users can view facilities"
ON public.facilities
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only admins can insert facilities
CREATE POLICY "Admins can insert facilities"
ON public.facilities
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Only admins can update facilities
CREATE POLICY "Admins can update facilities"
ON public.facilities
FOR UPDATE
USING (is_admin(auth.uid()));

-- Only admins can delete facilities
CREATE POLICY "Admins can delete facilities"
ON public.facilities
FOR DELETE
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_facilities_updated_at
BEFORE UPDATE ON public.facilities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();