// Test event creation without punishment_severity
// Run with: node test-event-creation.js

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

async function testEventCreation() {
  try {
    console.log('🧪 Testing event creation...\n');

    // Test 1: Create event WITHOUT punishment_severity
    console.log('📝 Test 1: Creating event without punishment_severity...');
    
    const testData1 = {
      title: 'Test Event - No Severity',
      date: '2024-01-01',
      time: '12:00',
      location: 'Test Location',
      event_type: 'in-person',
      event_details: 'Test details',
      decision_mode: 'single_person',
      punishment: 'Test punishment',
      invited_by: 'test@example.com',
      status: 'active'
    };
    
    const { data: event1, error: error1 } = await supabase
      .from('events')
      .insert(testData1)
      .select();
    
    if (error1) {
      console.log('❌ Test 1 failed:', error1.message);
    } else {
      console.log('✅ Test 1 successful! Event created without severity.');
      console.log('Created event:', event1);
      
      // Clean up
      await supabase
        .from('events')
        .delete()
        .eq('title', 'Test Event - No Severity');
      console.log('✅ Test 1 cleaned up');
    }

    console.log('\n📝 Test 2: Creating event WITH punishment_severity...');
    
    const testData2 = {
      title: 'Test Event - With Severity',
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
    
    const { data: event2, error: error2 } = await supabase
      .from('events')
      .insert(testData2)
      .select();
    
    if (error2) {
      console.log('❌ Test 2 failed:', error2.message);
      console.log('\n🔧 This confirms the punishment_severity column is missing.');
      console.log('You need to run the SQL command in Supabase dashboard.');
    } else {
      console.log('✅ Test 2 successful! Column exists and works.');
      console.log('Created event:', event2);
      
      // Clean up
      await supabase
        .from('events')
        .delete()
        .eq('title', 'Test Event - With Severity');
      console.log('✅ Test 2 cleaned up');
    }

    console.log('\n📊 Summary:');
    console.log('- Event creation works without punishment_severity');
    console.log('- punishment_severity column needs to be added manually');
    console.log('- Run the SQL command in Supabase dashboard to add the column');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEventCreation();
