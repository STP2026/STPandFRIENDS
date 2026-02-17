-- Add explicit policies for INSERT, UPDATE, DELETE on user_roles table
-- This prevents privilege escalation by ensuring only admins can modify roles

-- Add explicit INSERT policy - only admins can create new roles
CREATE POLICY "Only admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

-- Add explicit UPDATE policy - only admins can update roles
CREATE POLICY "Only admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Add explicit DELETE policy - only admins can delete roles
CREATE POLICY "Only admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (public.is_admin(auth.uid()));