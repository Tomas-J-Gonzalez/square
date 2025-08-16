// Run Database Migration
// This script adds missing columns to the events table

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.error('  SUPABASE_URL:', !!process.env.SUPABASE_URL);
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🔧 Running database migration...\n');
  
  try {
    // Read the migration SQL
    const migrationSQL = fs.readFileSync('fix-database-status.sql', 'utf8');
    
    console.log('1️⃣ Adding status column to events table...');
    const { error: statusError } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (statusError) {
      console.error('Error running migration:', statusError);
      return;
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Changes made:');
    console.log('  - Added status column to events table');
    console.log('  - Added updated_at column to events table');
    console.log('  - Added email and message columns to event_rsvps table');
    console.log('  - Created update trigger for updated_at');
    console.log('  - Added RLS policy for event updates');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigration();
