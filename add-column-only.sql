-- Minimal script to add only the missing column
-- Run this in your Supabase SQL editor

-- Add the missing punishment_severity column
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS punishment_severity integer DEFAULT 5;

-- Update existing events to have default severity
UPDATE public.events 
SET punishment_severity = 5 
WHERE punishment_severity IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'punishment_severity';
