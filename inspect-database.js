/**
 * Database Inspection Script
 * 
 * This script inspects your current Supabase database schema and tables.
 * Run this and share the output with me so I can help you fix any issues.
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

async function inspectDatabase() {
  console.log('🔍 Inspecting Supabase Database Schema...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  console.log('📋 Environment Variables:');
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ SET' : '❌ MISSING'}`);
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? '✅ SET' : '❌ MISSING'}`);
  console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anonKey ? '✅ SET' : '❌ MISSING'}\n`);

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ ERROR: Missing required Supabase environment variables!');
    console.log('\n📝 To fix this, add the following to your .env file:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here');
    console.log('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here');
    console.log('\n🔗 Get these values from your Supabase project dashboard:');
    console.log('   https://supabase.com/dashboard/project/[your-project-id]/settings/api');
    return;
  }

  try {
    // Test connection with service role key
    console.log('🔌 Testing connection with service role key...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Connection failed:', testError.message);
      
      if (testError.message.includes('relation "users" does not exist')) {
        console.log('\n📋 The "users" table does not exist in your database.');
        console.log('📝 You need to run the database schema setup.');
        console.log('\n🔧 To fix this:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Run the SQL from supabase-rsvp-schema.sql');
        console.log('4. Or run the schema from README.md');
      }
      return;
    }

    console.log('✅ Connection successful!\n');

    // Test required tables
    console.log('📊 Testing required tables...');
    
    const tables = ['users', 'email_confirmations', 'events', 'event_rsvps'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`  ❌ ${table}: ${error.message}`);
        } else {
          console.log(`  ✅ ${table}: Table exists`);
        }
      } catch (err) {
        console.log(`  ❌ ${table}: ${err.message}`);
      }
    }

    console.log('\n🎉 Database connection test completed!');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

// Run the test
inspectDatabase().catch(console.error);
