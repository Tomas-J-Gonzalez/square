-- Add event_type and event_details columns to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'in-person';

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_details text;

-- Update existing events to have 'in-person' event type
UPDATE public.events
SET event_type = 'in-person'
WHERE event_type IS NULL;
