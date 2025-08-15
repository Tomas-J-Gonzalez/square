-- Fix Missing Columns in event_rsvps table
-- Run this in your Supabase SQL editor

-- Add missing columns to event_rsvps table
ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS message text,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'event_rsvps' 
ORDER BY ordinal_position;
