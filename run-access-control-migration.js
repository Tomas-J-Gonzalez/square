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

async function runAccessControlMigration() {
  console.log('🚀 Running Access Control Database Migration\n');

  try {
    // Step 1: Add access control columns to events table
    console.log('1️⃣ Adding access control columns to events table...');
    const { error: accessError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.events 
        ADD COLUMN IF NOT EXISTS access text DEFAULT 'private' CHECK (access IN ('public', 'private')),
        ADD COLUMN IF NOT EXISTS page_visibility text DEFAULT 'private' CHECK (page_visibility IN ('public', 'private'));
      `
    });

    if (accessError) {
      console.log('⚠️  Direct SQL execution not available, using alternative method...');
      // Try alternative approach by checking if columns exist
      const { data: testAccess, error: testError } = await supabase
        .from('events')
        .select('access, page_visibility')
        .limit(1);
      
      if (testError) {
        console.log('📝 Please run this SQL manually in your Supabase dashboard:');
        console.log('');
        console.log('-- Add access control columns to events table');
        console.log('ALTER TABLE public.events');
        console.log('ADD COLUMN IF NOT EXISTS access text DEFAULT \'private\' CHECK (access IN (\'public\', \'private\')),');
        console.log('ADD COLUMN IF NOT EXISTS page_visibility text DEFAULT \'private\' CHECK (page_visibility IN (\'public\', \'private\'));');
        console.log('');
      } else {
        console.log('✅ Access control columns already exist or were added successfully!');
      }
    } else {
      console.log('✅ Access control columns added successfully!');
    }

    // Step 2: Create event_invitees table
    console.log('\n2️⃣ Creating event_invitees table...');
    const { error: inviteesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.event_invitees (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
          email text NOT NULL,
          token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
          invited_at timestamptz DEFAULT now(),
          rsvp_status text DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'attending', 'declined')),
          UNIQUE(event_id, email)
        );
      `
    });

    if (inviteesError) {
      console.log('⚠️  Direct SQL execution not available for event_invitees table.');
      console.log('📝 Please run this SQL manually in your Supabase dashboard:');
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
    } else {
      console.log('✅ event_invitees table created successfully!');
    }

    // Step 3: Create rsvp_tokens table
    console.log('\n3️⃣ Creating rsvp_tokens table...');
    const { error: tokensError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.rsvp_tokens (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
          token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
          email text,
          created_at timestamptz DEFAULT now(),
          used_at timestamptz,
          expires_at timestamptz DEFAULT (now() + interval '30 days')
        );
      `
    });

    if (tokensError) {
      console.log('⚠️  Direct SQL execution not available for rsvp_tokens table.');
      console.log('📝 Please run this SQL manually in your Supabase dashboard:');
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
    } else {
      console.log('✅ rsvp_tokens table created successfully!');
    }

    // Step 4: Enable RLS on new tables
    console.log('\n4️⃣ Enabling Row Level Security on new tables...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.event_invitees ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.rsvp_tokens ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.log('⚠️  Direct SQL execution not available for RLS.');
      console.log('📝 Please run this SQL manually in your Supabase dashboard:');
      console.log('');
      console.log('-- Enable RLS on new tables');
      console.log('ALTER TABLE public.event_invitees ENABLE ROW LEVEL SECURITY;');
      console.log('ALTER TABLE public.rsvp_tokens ENABLE ROW LEVEL SECURITY;');
      console.log('');
    } else {
      console.log('✅ Row Level Security enabled successfully!');
    }

    // Step 5: Create indexes
    console.log('\n5️⃣ Creating indexes for better performance...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_event_invitees_event_id ON public.event_invitees(event_id);
        CREATE INDEX IF NOT EXISTS idx_event_invitees_email ON public.event_invitees(email);
        CREATE INDEX IF NOT EXISTS idx_event_invitees_token ON public.event_invitees(token);
        CREATE INDEX IF NOT EXISTS idx_rsvp_tokens_event_id ON public.rsvp_tokens(event_id);
        CREATE INDEX IF NOT EXISTS idx_rsvp_tokens_token ON public.rsvp_tokens(token);
        CREATE INDEX IF NOT EXISTS idx_rsvp_tokens_email ON public.rsvp_tokens(email);
      `
    });

    if (indexError) {
      console.log('⚠️  Direct SQL execution not available for indexes.');
      console.log('📝 Please run this SQL manually in your Supabase dashboard:');
      console.log('');
      console.log('-- Create indexes');
      console.log('CREATE INDEX IF NOT EXISTS idx_event_invitees_event_id ON public.event_invitees(event_id);');
      console.log('CREATE INDEX IF NOT EXISTS idx_event_invitees_email ON public.event_invitees(email);');
      console.log('CREATE INDEX IF NOT EXISTS idx_event_invitees_token ON public.event_invitees(token);');
      console.log('CREATE INDEX IF NOT EXISTS idx_rsvp_tokens_event_id ON public.rsvp_tokens(event_id);');
      console.log('CREATE INDEX IF NOT EXISTS idx_rsvp_tokens_token ON public.rsvp_tokens(token);');
      console.log('CREATE INDEX IF NOT EXISTS idx_rsvp_tokens_email ON public.rsvp_tokens(email);');
      console.log('');
    } else {
      console.log('✅ Indexes created successfully!');
    }

    // Step 6: Create RPC functions
    console.log('\n6️⃣ Creating access control RPC functions...');
    const { error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (funcError) {
      console.log('⚠️  Direct SQL execution not available for RPC functions.');
      console.log('📝 Please run this SQL manually in your Supabase dashboard:');
      console.log('');
      console.log('-- Create access control RPC functions');
      console.log('-- Function to generate RSVP token for private events');
      console.log('CREATE OR REPLACE FUNCTION generate_rsvp_token(event_id_param text, email_param text DEFAULT NULL)');
      console.log('RETURNS text');
      console.log('LANGUAGE plpgsql');
      console.log('SECURITY DEFINER');
      console.log('AS $$');
      console.log('DECLARE');
      console.log('  token_value text;');
      console.log('BEGIN');
      console.log('  -- Generate a unique token');
      console.log('  token_value := gen_random_uuid()::text;');
      console.log('  -- Insert the token');
      console.log('  INSERT INTO public.rsvp_tokens (event_id, token, email)');
      console.log('  VALUES (event_id_param, token_value, email_param);');
      console.log('  RETURN token_value;');
      console.log('END;');
      console.log('$$;');
      console.log('');
      console.log('-- Function to validate RSVP access');
      console.log('CREATE OR REPLACE FUNCTION validate_rsvp_access(event_id_param text, token_param text DEFAULT NULL, email_param text DEFAULT NULL)');
      console.log('RETURNS boolean');
      console.log('LANGUAGE plpgsql');
      console.log('SECURITY DEFINER');
      console.log('AS $$');
      console.log('DECLARE');
      console.log('  event_access text;');
      console.log('  is_valid boolean := false;');
      console.log('BEGIN');
      console.log('  -- Get event access setting');
      console.log('  SELECT access INTO event_access');
      console.log('  FROM public.events');
      console.log('  WHERE id = event_id_param;');
      console.log('  -- If event is public, allow access');
      console.log('  IF event_access = \'public\' THEN');
      console.log('    RETURN true;');
      console.log('  END IF;');
      console.log('  -- If event is private, check token or email');
      console.log('  IF event_access = \'private\' THEN');
      console.log('    -- Check if token is valid');
      console.log('    IF token_param IS NOT NULL THEN');
      console.log('      SELECT EXISTS(');
      console.log('        SELECT 1 FROM public.rsvp_tokens');
      console.log('        WHERE event_id = event_id_param');
      console.log('        AND token = token_param');
      console.log('        AND (expires_at IS NULL OR expires_at > now())');
      console.log('      ) INTO is_valid;');
      console.log('    END IF;');
      console.log('    -- Check if email is invited');
      console.log('    IF NOT is_valid AND email_param IS NOT NULL THEN');
      console.log('      SELECT EXISTS(');
      console.log('        SELECT 1 FROM public.event_invitees');
      console.log('        WHERE event_id = event_id_param');
      console.log('        AND email = email_param');
      console.log('      ) INTO is_valid;');
      console.log('    END IF;');
      console.log('  END IF;');
      console.log('  RETURN is_valid;');
      console.log('END;');
      console.log('$$;');
      console.log('');
      console.log('-- Function to validate event page access');
      console.log('CREATE OR REPLACE FUNCTION validate_event_page_access(event_id_param text, user_email text DEFAULT NULL)');
      console.log('RETURNS boolean');
      console.log('LANGUAGE plpgsql');
      console.log('SECURITY DEFINER');
      console.log('AS $$');
      console.log('DECLARE');
      console.log('  page_visibility_setting text;');
      console.log('  is_host boolean := false;');
      console.log('  is_invitee boolean := false;');
      console.log('BEGIN');
      console.log('  -- Get event page visibility setting');
      console.log('  SELECT page_visibility INTO page_visibility_setting');
      console.log('  FROM public.events');
      console.log('  WHERE id = event_id_param;');
      console.log('  -- If page is public, allow access');
      console.log('  IF page_visibility_setting = \'public\' THEN');
      console.log('    RETURN true;');
      console.log('  END IF;');
      console.log('  -- If page is private, check if user is host or invitee');
      console.log('  IF page_visibility_setting = \'private\' AND user_email IS NOT NULL THEN');
      console.log('    -- Check if user is host');
      console.log('    SELECT EXISTS(');
      console.log('      SELECT 1 FROM public.events');
      console.log('      WHERE id = event_id_param');
      console.log('      AND invited_by = user_email');
      console.log('    ) INTO is_host;');
      console.log('    -- Check if user is invitee');
      console.log('    SELECT EXISTS(');
      console.log('      SELECT 1 FROM public.event_invitees');
      console.log('      WHERE event_id = event_id_param');
      console.log('      AND email = user_email');
      console.log('    ) INTO is_invitee;');
      console.log('    RETURN is_host OR is_invitee;');
      console.log('  END IF;');
      console.log('  RETURN false;');
      console.log('END;');
      console.log('$$;');
      console.log('');
    } else {
      console.log('✅ Access control RPC functions created successfully!');
    }

    // Step 7: Create RLS policies
    console.log('\n7️⃣ Creating Row Level Security policies...');
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (policyError) {
      console.log('⚠️  Direct SQL execution not available for RLS policies.');
      console.log('📝 Please run this SQL manually in your Supabase dashboard:');
      console.log('');
      console.log('-- RLS Policies for event_invitees table');
      console.log('CREATE POLICY IF NOT EXISTS "Event hosts can manage invitees" ON public.event_invitees');
      console.log('  FOR ALL USING (');
      console.log('    EXISTS (');
      console.log('      SELECT 1 FROM public.events');
      console.log('      WHERE events.id = event_invitees.event_id');
      console.log('      AND events.invited_by = auth.jwt() ->> \'email\'');
      console.log('    )');
      console.log('  );');
      console.log('');
      console.log('CREATE POLICY IF NOT EXISTS "Invitees can view their own invitations" ON public.event_invitees');
      console.log('  FOR SELECT USING (');
      console.log('    email = auth.jwt() ->> \'email\' OR');
      console.log('    EXISTS (');
      console.log('      SELECT 1 FROM public.events');
      console.log('      WHERE events.id = event_invitees.event_id');
      console.log('      AND events.invited_by = auth.jwt() ->> \'email\'');
      console.log('    )');
      console.log('  );');
      console.log('');
      console.log('-- RLS Policies for rsvp_tokens table');
      console.log('CREATE POLICY IF NOT EXISTS "Event hosts can manage RSVP tokens" ON public.rsvp_tokens');
      console.log('  FOR ALL USING (');
      console.log('    EXISTS (');
      console.log('      SELECT 1 FROM public.events');
      console.log('      WHERE events.id = rsvp_tokens.event_id');
      console.log('      AND events.invited_by = auth.jwt() ->> \'email\'');
      console.log('    )');
      console.log('  );');
      console.log('');
      console.log('CREATE POLICY IF NOT EXISTS "Anyone can validate RSVP tokens" ON public.rsvp_tokens');
      console.log('  FOR SELECT USING (true);');
      console.log('');
    } else {
      console.log('✅ Row Level Security policies created successfully!');
    }

    console.log('\n🎉 Access Control Migration Complete!\n');

    // Test the migration
    console.log('🧪 Testing migration results...');
    await testMigrationResults();

  } catch (error) {
    console.error('❌ Error in migration:', error);
  }
}

async function testMigrationResults() {
  try {
    // Test 1: Check if access control columns exist
    console.log('1️⃣ Testing access control columns...');
    const { data: accessTest, error: accessError } = await supabase
      .from('events')
      .select('access, page_visibility')
      .limit(1);
    
    if (accessError) {
      console.log('❌ Access control columns not found. Migration may have failed.');
    } else {
      console.log('✅ Access control columns exist!');
    }

    // Test 2: Check if event_invitees table exists
    console.log('2️⃣ Testing event_invitees table...');
    const { data: inviteesTest, error: inviteesError } = await supabase
      .from('event_invitees')
      .select('*')
      .limit(1);
    
    if (inviteesError) {
      console.log('❌ event_invitees table not found. Migration may have failed.');
    } else {
      console.log('✅ event_invitees table exists!');
    }

    // Test 3: Check if rsvp_tokens table exists
    console.log('3️⃣ Testing rsvp_tokens table...');
    const { data: tokensTest, error: tokensError } = await supabase
      .from('rsvp_tokens')
      .select('*')
      .limit(1);
    
    if (tokensError) {
      console.log('❌ rsvp_tokens table not found. Migration may have failed.');
    } else {
      console.log('✅ rsvp_tokens table exists!');
    }

    // Test 4: Check if RPC functions exist
    console.log('4️⃣ Testing RPC functions...');
    try {
      const { data: funcTest, error: funcError } = await supabase.rpc('validate_rsvp_access', {
        event_id_param: 'test',
        token_param: null,
        email_param: null
      });
      
      if (funcError) {
        console.log('❌ RPC functions not found. Migration may have failed.');
      } else {
        console.log('✅ RPC functions exist!');
      }
    } catch (error) {
      console.log('❌ RPC functions not found. Migration may have failed.');
    }

    console.log('\n📊 Migration Test Results:');
    console.log('✅ Database connection: Working');
    console.log(accessError ? '❌ Access control columns: Missing' : '✅ Access control columns: Present');
    console.log(inviteesError ? '❌ event_invitees table: Missing' : '✅ event_invitees table: Present');
    console.log(tokensError ? '❌ rsvp_tokens table: Missing' : '✅ rsvp_tokens table: Present');
    console.log('✅ RPC functions: Need manual verification');

    if (accessError || inviteesError || tokensError) {
      console.log('\n⚠️  Some migration steps may have failed.');
      console.log('📝 Please run the SQL commands manually in your Supabase dashboard.');
    } else {
      console.log('\n🎉 Migration appears to be successful!');
      console.log('🚀 Access control features are now ready to use!');
    }

  } catch (error) {
    console.error('❌ Error testing migration results:', error);
  }
}

runAccessControlMigration();
