-- Safe database updates that won't cause errors if objects already exist
-- Run this in your Supabase SQL editor

-- Add the missing punishment_severity column (safe)
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS punishment_severity integer DEFAULT 5;

-- Update existing events to have default severity (safe)
UPDATE public.events 
SET punishment_severity = 5 
WHERE punishment_severity IS NULL;

-- Create performance indexes (safe - IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_invited_by ON public.events(invited_by);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);

-- Create or replace the trigger function (safe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists, then recreate it (safe)
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON public.events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'punishment_severity';
