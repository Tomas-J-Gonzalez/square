import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAccessControlColumns() {
  try {
    console.log('🔧 Adding access control columns to events table...');
    
    // Add access control columns
    const { error: accessError } = await supabase
      .from('events')
      .select('id')
      .limit(1);
    
    if (accessError) {
      console.error('Error testing connection:', accessError);
      return;
    }
    
    console.log('✅ Database connection successful!');
    console.log('📝 Please run the following SQL in your Supabase dashboard:');
    console.log('');
    console.log('-- Add access control columns to events table');
    console.log('ALTER TABLE public.events');
    console.log('ADD COLUMN IF NOT EXISTS access text DEFAULT \'private\' CHECK (access IN (\'public\', \'private\')),');
    console.log('ADD COLUMN IF NOT EXISTS page_visibility text DEFAULT \'private\' CHECK (page_visibility IN (\'public\', \'private\'));');
    console.log('');
    console.log('-- Create event_invitees table');
    console.log('CREATE TABLE IF NOT EXISTS public.event_invitees (');
    console.log('  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),');
    console.log('  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,');
    console.log('  email text NOT NULL,');
    console.log('  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,');
    console.log('  invited_at timestamptz DEFAULT now(),');
    console.log('  rsvp_status text DEFAULT \'pending\' CHECK (rsvp_status IN (\'pending\', \'attending\', \'declined\')),');
    console.log('  UNIQUE(event_id, email)');
    console.log(');');
    console.log('');
    console.log('-- Create rsvp_tokens table');
    console.log('CREATE TABLE IF NOT EXISTS public.rsvp_tokens (');
    console.log('  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),');
    console.log('  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,');
    console.log('  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,');
    console.log('  email text,');
    console.log('  created_at timestamptz DEFAULT now(),');
    console.log('  used_at timestamptz,');
    console.log('  expires_at timestamptz DEFAULT (now() + interval \'30 days\')');
    console.log(');');
    console.log('');
    console.log('-- Enable RLS on new tables');
    console.log('ALTER TABLE public.event_invitees ENABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE public.rsvp_tokens ENABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Create indexes');
    console.log('CREATE INDEX IF NOT EXISTS idx_event_invitees_event_id ON public.event_invitees(event_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_event_invitees_email ON public.event_invitees(email);');
    console.log('CREATE INDEX IF NOT EXISTS idx_event_invitees_token ON public.event_invitees(token);');
    console.log('CREATE INDEX IF NOT EXISTS idx_rsvp_tokens_event_id ON public.rsvp_tokens(event_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_rsvp_tokens_token ON public.rsvp_tokens(token);');
    console.log('CREATE INDEX IF NOT EXISTS idx_rsvp_tokens_email ON public.rsvp_tokens(email);');
    
  } catch (error) {
    console.error('Error in addAccessControlColumns:', error);
  }
}

addAccessControlColumns();
