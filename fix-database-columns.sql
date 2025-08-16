-- Add missing columns to events table
-- Run this in your Supabase SQL editor

-- Add missing columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'in-person',
ADD COLUMN IF NOT EXISTS event_details text,
ADD COLUMN IF NOT EXISTS punishment_severity integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update existing events to have default values
UPDATE public.events 
SET 
  event_type = COALESCE(event_type, 'in-person'),
  punishment_severity = COALESCE(punishment_severity, 5),
  status = COALESCE(status, 'active')
WHERE event_type IS NULL OR punishment_severity IS NULL OR status IS NULL;

-- Create index for status column for better performance
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_invited_by ON public.events(invited_by);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON public.events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
