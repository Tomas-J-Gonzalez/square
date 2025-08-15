/**
 * Fix Database Columns Script
 * 
 * This script adds missing columns to the event_rsvps table.
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

async function fixDatabaseColumns() {
  console.log('🔧 Fixing Database Columns...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase environment variables!');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('📋 Adding missing columns to event_rsvps table...');
    
    // Add missing columns one by one
    const columnsToAdd = [
      {
        name: 'email',
        sql: 'ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS email text'
      },
      {
        name: 'message',
        sql: 'ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS message text'
      },
      {
        name: 'created_at',
        sql: 'ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now()'
      }
    ];

    for (const column of columnsToAdd) {
      console.log(`🔧 Adding column: ${column.name}`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: column.sql });
      
      if (error) {
        console.log(`❌ Error adding column ${column.name}:`, error);
      } else {
        console.log(`✅ Added column: ${column.name}`);
      }
    }

    // Verify the table structure
    console.log('\n📊 Verifying table structure...');
    
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'event_rsvps')
      .order('ordinal_position');

    if (columnError) {
      console.log('❌ Error checking table structure:', columnError);
    } else {
      console.log('📋 Current event_rsvps table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
    }

    // Test the RSVP functionality
    console.log('\n🧪 Testing RSVP functionality...');
    
    const testData = {
      eventId: 'test-fix-' + Date.now(),
      name: 'Test User',
      email: 'test@example.com',
      willAttend: true,
      message: 'Test message'
    };

    const response = await fetch('http://localhost:3002/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ RSVP API test successful!');
      console.log('   Participant:', result.participant);
    } else {
      console.log('❌ RSVP API test failed:', result.error);
    }

  } catch (error) {
    console.log('❌ Error fixing database columns:', error);
  }
}

// Run the fix
fixDatabaseColumns().catch(console.error);
