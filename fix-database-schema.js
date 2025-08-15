/**
 * Fix Database Schema Script
 * 
 * This script adds missing columns to the database tables.
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

async function fixDatabaseSchema() {
  console.log('🔧 Fixing Database Schema...\n');

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
    // Check if event_rsvps table has email column
    console.log('📋 Checking event_rsvps table structure...');
    
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'event_rsvps');

    if (columnError) {
      console.log('❌ Error checking table structure:', columnError);
      return;
    }

    const columnNames = columns.map(col => col.column_name);
    console.log('📊 Current columns:', columnNames);

    // Check for missing columns
    const requiredColumns = ['id', 'event_id', 'name', 'email', 'will_attend', 'message', 'created_at'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

    if (missingColumns.length > 0) {
      console.log('⚠️ Missing columns:', missingColumns);
      
      // Add missing columns
      for (const column of missingColumns) {
        console.log(`🔧 Adding column: ${column}`);
        
        let sql = '';
        switch (column) {
          case 'email':
            sql = 'ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS email text';
            break;
          case 'message':
            sql = 'ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS message text';
            break;
          case 'created_at':
            sql = 'ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now()';
            break;
          default:
            console.log(`⚠️ Unknown column: ${column}`);
            continue;
        }

        const { error: alterError } = await supabase.rpc('exec_sql', { sql });
        
        if (alterError) {
          console.log(`❌ Error adding column ${column}:`, alterError);
        } else {
          console.log(`✅ Added column: ${column}`);
        }
      }
    } else {
      console.log('✅ All required columns exist');
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
    console.log('❌ Error fixing database schema:', error);
  }
}

// Run the fix
fixDatabaseSchema().catch(console.error);
