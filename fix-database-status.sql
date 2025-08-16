-- Add missing columns to events table
-- Run this in your Supabase SQL editor

-- Add status column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Add updated_at column if it doesn't exist
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add email and message columns to event_rsvps table if they don't exist
ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS message text;

-- Update existing events to have 'active' status
UPDATE public.events 
SET status = 'active' 
WHERE status IS NULL;

-- Add update trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for events table
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON public.events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policy for event updates
DROP POLICY IF EXISTS "Allow event updates" ON public.events;
CREATE POLICY "Allow event updates" ON public.events
  FOR UPDATE USING (true);
