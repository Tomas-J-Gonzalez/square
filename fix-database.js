/**
 * Database Fix Script
 * 
 * This script automatically fixes common database schema issues.
 * Run this after setting up your Supabase environment variables.
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

async function fixDatabase() {
  console.log('🔧 Fixing Supabase Database Schema...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ ERROR: Missing Supabase environment variables!');
    console.log('Please set up your .env file first.');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('📋 Step 1: Creating missing tables...\n');

    // Create users table if it doesn't exist
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.users (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            email text UNIQUE NOT NULL,
            name text NOT NULL,
            password_hash text NOT NULL,
            email_confirmed boolean DEFAULT false,
            confirmed_at timestamptz,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            last_login_at timestamptz,
            event_ids text[] DEFAULT array[]::text[]
          );
        `
      });
      console.log('✅ users table: Created or already exists');
    } catch (error) {
      console.log('⚠️ users table: Error (might already exist)');
    }

    // Create events table if it doesn't exist
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.events (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            title text NOT NULL,
            date date NOT NULL,
            time text,
            location text,
            decision_mode text DEFAULT 'none',
            punishment text DEFAULT '',
            invited_by text,
            created_at timestamptz DEFAULT now()
          );
        `
      });
      console.log('✅ events table: Created or already exists');
    } catch (error) {
      console.log('⚠️ events table: Error (might already exist)');
    }

    // Create event_rsvps table if it doesn't exist
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.event_rsvps (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
            name text NOT NULL,
            email text,
            will_attend boolean NOT NULL,
            message text,
            created_at timestamptz DEFAULT now()
          );
        `
      });
      console.log('✅ event_rsvps table: Created or already exists');
    } catch (error) {
      console.log('⚠️ event_rsvps table: Error (might already exist)');
    }

    // Create email_confirmations table if it doesn't exist
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.email_confirmations (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            token text UNIQUE NOT NULL,
            user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            email text NOT NULL,
            used boolean DEFAULT false,
            expires_at timestamptz NOT NULL,
            created_at timestamptz DEFAULT now()
          );
        `
      });
      console.log('✅ email_confirmations table: Created or already exists');
    } catch (error) {
      console.log('⚠️ email_confirmations table: Error (might already exist)');
    }

    console.log('\n📋 Step 2: Adding missing columns...\n');

    // Check and add missing columns to email_confirmations
    try {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'email_confirmations');

      if (!columnsError) {
        const columnNames = columns.map(col => col.column_name);
        
        if (!columnNames.includes('user_id')) {
          await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE public.email_confirmations ADD COLUMN user_id uuid REFERENCES public.users(id) ON DELETE CASCADE;'
          });
          console.log('✅ Added user_id column to email_confirmations');
        } else {
          console.log('✅ user_id column: Already exists');
        }

        if (!columnNames.includes('email')) {
          await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE public.email_confirmations ADD COLUMN email text;'
          });
          console.log('✅ Added email column to email_confirmations');
        } else {
          console.log('✅ email column: Already exists');
        }

        if (!columnNames.includes('used')) {
          await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE public.email_confirmations ADD COLUMN used boolean DEFAULT false;'
          });
          console.log('✅ Added used column to email_confirmations');
        } else {
          console.log('✅ used column: Already exists');
        }

        if (!columnNames.includes('expires_at')) {
          await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE public.email_confirmations ADD COLUMN expires_at timestamptz;'
          });
          console.log('✅ Added expires_at column to email_confirmations');
        } else {
          console.log('✅ expires_at column: Already exists');
        }
      }
    } catch (error) {
      console.log('⚠️ Error checking/adding columns:', error.message);
    }

    console.log('\n📋 Step 3: Enabling RLS...\n');

    // Enable RLS on all tables
    const tables = ['users', 'email_confirmations', 'events', 'event_rsvps'];
    for (const table of tables) {
      try {
        await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`
        });
        console.log(`✅ RLS enabled on ${table}`);
      } catch (error) {
        console.log(`⚠️ RLS on ${table}: Error (might already be enabled)`);
      }
    }

    console.log('\n📋 Step 4: Creating indexes...\n');

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_events_id ON public.events(id);',
      'CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON public.event_rsvps(event_id);',
      'CREATE INDEX IF NOT EXISTS idx_event_rsvps_name ON public.event_rsvps(name);',
      'CREATE INDEX IF NOT EXISTS idx_event_rsvps_will_attend ON public.event_rsvps(will_attend);',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);',
      'CREATE INDEX IF NOT EXISTS idx_email_confirmations_token ON public.email_confirmations(token);',
      'CREATE INDEX IF NOT EXISTS idx_email_confirmations_user_id ON public.email_confirmations(user_id);',
      'CREATE UNIQUE INDEX IF NOT EXISTS unique_event_participant ON public.event_rsvps (event_id, lower(name));'
    ];

    for (const indexSql of indexes) {
      try {
        await supabase.rpc('exec_sql', { sql: indexSql });
        console.log('✅ Index created or already exists');
      } catch (error) {
        console.log('⚠️ Index creation error (might already exist)');
      }
    }

    console.log('\n🎉 Database fix completed!');
    console.log('\n🧪 Now run: node test-db-connection.js');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

// Run the fix
fixDatabase().catch(console.error);
