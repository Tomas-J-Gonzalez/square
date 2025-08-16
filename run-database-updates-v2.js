// Run database updates using Supabase client
// Run with: node run-database-updates-v2.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDatabaseUpdates() {
  try {
    console.log('🔄 Running database updates...\n');

    // Test current table structure
    console.log('📊 Checking current table structure...');
    
    const { data: currentEvents, error: currentError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
    
    if (currentError) {
      console.error('❌ Error checking current structure:', currentError);
      return;
    }
    
    console.log('Current event structure:', Object.keys(currentEvents[0] || {}));
    
    // Try to add the column by attempting an insert with the new field
    console.log('\n🔧 Attempting to add punishment_severity column...');
    
    // First, let's try to create a function that can execute SQL
    const { data: funcData, error: funcError } = await supabase
      .rpc('exec_sql', {
        sql: 'SELECT 1 as test;'
      });
    
    if (funcError) {
      console.log('⚠️  Direct SQL execution not available, trying alternative approach...');
      
      // Alternative: Try to work around the missing column
      console.log('\n🔄 Re-enabling punishment_severity in the API...');
      
      // Update the API to handle missing column gracefully
      const apiFile = 'app/api/events/route.js';
      console.log(`📝 You'll need to manually update ${apiFile} to re-enable punishment_severity`);
      
      console.log('\n📋 Manual steps required:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run this SQL:');
      console.log(`
        ALTER TABLE public.events 
        ADD COLUMN IF NOT EXISTS punishment_severity integer DEFAULT 5;
        
        UPDATE public.events 
        SET punishment_severity = 5 
        WHERE punishment_severity IS NULL;
      `);
      console.log('\n4. Then I can re-enable the severity slider in the code');
      
      return;
    }
    
    console.log('✅ Direct SQL execution available!');
    
    // Execute the SQL commands
    const sqlCommands = [
      'ALTER TABLE public.events ADD COLUMN IF NOT EXISTS punishment_severity integer DEFAULT 5;',
      'UPDATE public.events SET punishment_severity = 5 WHERE punishment_severity IS NULL;',
      'CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);',
      'CREATE INDEX IF NOT EXISTS idx_events_invited_by ON public.events(invited_by);',
      'CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);'
    ];
    
    for (const sql of sqlCommands) {
      console.log(`📝 Executing: ${sql.substring(0, 50)}...`);
      
      const { data, error } = await supabase
        .rpc('exec_sql', { sql });
      
      if (error) {
        console.log(`❌ Error: ${error.message}`);
      } else {
        console.log(`✅ Success`);
      }
    }
    
    // Test the new column
    console.log('\n🧪 Testing new column...');
    
    const testData = {
      title: 'Test Event - New Column',
      date: '2024-01-01',
      time: '12:00',
      location: 'Test Location',
      event_type: 'in-person',
      event_details: 'Test details',
      decision_mode: 'single_person',
      punishment: 'Test punishment',
      punishment_severity: 7,
      invited_by: 'test@example.com',
      status: 'active'
    };
    
    const { data: testEvent, error: testError } = await supabase
      .from('events')
      .insert(testData)
      .select();
    
    if (testError) {
      console.log('❌ Test failed:', testError.message);
    } else {
      console.log('✅ Test successful! Column added.');
      console.log('Created event:', testEvent);
      
      // Clean up
      await supabase
        .from('events')
        .delete()
        .eq('title', 'Test Event - New Column');
      console.log('✅ Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

runDatabaseUpdates();
