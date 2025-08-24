-- Add access control fields to events table
-- Stage 1: Public vs Private RSVP system
-- Stage 2: Public vs Private Event Pages

-- Add new columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS access text DEFAULT 'private' CHECK (access IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS page_visibility text DEFAULT 'private' CHECK (page_visibility IN ('public', 'private'));

-- Create table for event invitees (for private events)
CREATE TABLE IF NOT EXISTS public.event_invitees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  invited_at timestamptz DEFAULT now(),
  rsvp_status text DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'attending', 'declined')),
  UNIQUE(event_id, email)
);

-- Create table for RSVP tokens (for private events)
CREATE TABLE IF NOT EXISTS public.rsvp_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  email text,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

-- Enable RLS on new tables
ALTER TABLE public.event_invitees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvp_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_invitees table
CREATE POLICY IF NOT EXISTS "Event hosts can manage invitees" ON public.event_invitees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_invitees.event_id 
      AND events.invited_by = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY IF NOT EXISTS "Invitees can view their own invitations" ON public.event_invitees
  FOR SELECT USING (
    email = auth.jwt() ->> 'email' OR
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_invitees.event_id 
      AND events.invited_by = auth.jwt() ->> 'email'
    )
  );

-- RLS Policies for rsvp_tokens table
CREATE POLICY IF NOT EXISTS "Event hosts can manage RSVP tokens" ON public.rsvp_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = rsvp_tokens.event_id 
      AND events.invited_by = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY IF NOT EXISTS "Anyone can validate RSVP tokens" ON public.rsvp_tokens
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_invitees_event_id ON public.event_invitees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_invitees_email ON public.event_invitees(email);
CREATE INDEX IF NOT EXISTS idx_event_invitees_token ON public.event_invitees(token);
CREATE INDEX IF NOT EXISTS idx_rsvp_tokens_event_id ON public.rsvp_tokens(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_tokens_token ON public.rsvp_tokens(token);
CREATE INDEX IF NOT EXISTS idx_rsvp_tokens_email ON public.rsvp_tokens(email);

-- Function to generate RSVP token for private events
CREATE OR REPLACE FUNCTION generate_rsvp_token(event_id_param text, email_param text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_value text;
BEGIN
  -- Generate a unique token
  token_value := gen_random_uuid()::text;
  
  -- Insert the token
  INSERT INTO public.rsvp_tokens (event_id, token, email)
  VALUES (event_id_param, token_value, email_param);
  
  RETURN token_value;
END;
$$;

-- Function to validate RSVP access
CREATE OR REPLACE FUNCTION validate_rsvp_access(event_id_param text, token_param text DEFAULT NULL, email_param text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_access text;
  is_valid boolean := false;
BEGIN
  -- Get event access setting
  SELECT access INTO event_access
  FROM public.events
  WHERE id = event_id_param;
  
  -- If event is public, allow access
  IF event_access = 'public' THEN
    RETURN true;
  END IF;
  
  -- If event is private, check token or email
  IF event_access = 'private' THEN
    -- Check if token is valid
    IF token_param IS NOT NULL THEN
      SELECT EXISTS(
        SELECT 1 FROM public.rsvp_tokens 
        WHERE event_id = event_id_param 
        AND token = token_param 
        AND (expires_at IS NULL OR expires_at > now())
      ) INTO is_valid;
    END IF;
    
    -- Check if email is invited
    IF NOT is_valid AND email_param IS NOT NULL THEN
      SELECT EXISTS(
        SELECT 1 FROM public.event_invitees 
        WHERE event_id = event_id_param 
        AND email = email_param
      ) INTO is_valid;
    END IF;
  END IF;
  
  RETURN is_valid;
END;
$$;

-- Function to validate event page access
CREATE OR REPLACE FUNCTION validate_event_page_access(event_id_param text, user_email text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  page_visibility_setting text;
  is_host boolean := false;
  is_invitee boolean := false;
BEGIN
  -- Get event page visibility setting
  SELECT page_visibility INTO page_visibility_setting
  FROM public.events
  WHERE id = event_id_param;
  
  -- If page is public, allow access
  IF page_visibility_setting = 'public' THEN
    RETURN true;
  END IF;
  
  -- If page is private, check if user is host or invitee
  IF page_visibility_setting = 'private' AND user_email IS NOT NULL THEN
    -- Check if user is host
    SELECT EXISTS(
      SELECT 1 FROM public.events 
      WHERE id = event_id_param 
      AND invited_by = user_email
    ) INTO is_host;
    
    -- Check if user is invitee
    SELECT EXISTS(
      SELECT 1 FROM public.event_invitees 
      WHERE event_id = event_id_param 
      AND email = user_email
    ) INTO is_invitee;
    
    RETURN is_host OR is_invitee;
  END IF;
  
  RETURN false;
END;
$$;
