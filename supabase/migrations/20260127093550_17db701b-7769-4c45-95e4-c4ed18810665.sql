-- Table for dog remarks (notes by admins/helpers)
CREATE TABLE public.dog_remarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dog_remarks ENABLE ROW LEVEL SECURITY;

-- Policies for dog_remarks
CREATE POLICY "Helpers can view all remarks" ON public.dog_remarks
FOR SELECT USING (is_helper_or_admin(auth.uid()));

CREATE POLICY "Helpers can create remarks" ON public.dog_remarks
FOR INSERT WITH CHECK (is_helper_or_admin(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can update own remarks" ON public.dog_remarks
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any remark" ON public.dog_remarks
FOR DELETE USING (is_admin(auth.uid()));

-- Table for change log (audit trail)
CREATE TABLE public.dog_change_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dog_change_log ENABLE ROW LEVEL SECURITY;

-- Policies for dog_change_log
CREATE POLICY "Helpers can view change log" ON public.dog_change_log
FOR SELECT USING (is_helper_or_admin(auth.uid()));

CREATE POLICY "System inserts change log" ON public.dog_change_log
FOR INSERT WITH CHECK (is_helper_or_admin(auth.uid()) AND auth.uid() = user_id);

-- Table for messages between admins/helpers
CREATE TABLE public.team_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.team_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

-- Policies for team_messages
CREATE POLICY "Helpers can view all messages" ON public.team_messages
FOR SELECT USING (is_helper_or_admin(auth.uid()));

CREATE POLICY "Helpers can create messages" ON public.team_messages
FOR INSERT WITH CHECK (is_helper_or_admin(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON public.team_messages
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any message" ON public.team_messages
FOR DELETE USING (is_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_dog_remarks_updated_at
BEFORE UPDATE ON public.dog_remarks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_messages_updated_at
BEFORE UPDATE ON public.team_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for team messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_messages;