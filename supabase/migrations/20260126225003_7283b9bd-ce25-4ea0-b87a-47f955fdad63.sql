-- Add INSERT policy to prevent unauthorized profile creation
-- Profiles are auto-created by the handle_new_user trigger, 
-- but we need to ensure users can only create their own profile if needed

CREATE POLICY "Users can only insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);