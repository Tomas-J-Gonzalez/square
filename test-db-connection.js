// Test database connection and schema
// Run with: node test-db-connection.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Connection error:', error);
      return;
    }
    
    console.log('✅ Database connection successful');
    console.log('Sample events data:', data);
    
    // Check table schema
    console.log('\nChecking events table schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'events' });
    
    if (schemaError) {
      console.log('Could not get schema info, trying alternative method...');
      // Try to insert a test record to see what columns exist
      const testData = {
        title: 'Test Event',
        date: '2024-01-01',
        time: '12:00',
        location: 'Test Location',
        event_type: 'in-person',
        event_details: 'Test details',
        decision_mode: 'single_person',
        punishment: 'Test punishment',
        punishment_severity: 5,
        invited_by: 'test@example.com',
        status: 'active'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('events')
        .insert(testData)
        .select();
      
      if (insertError) {
        console.error('❌ Insert test failed:', insertError);
        console.error('Error details:', insertError.message, insertError.details, insertError.hint);
      } else {
        console.log('✅ Insert test successful');
        console.log('Inserted data:', insertData);
        
        // Clean up test data
        await supabase
          .from('events')
          .delete()
          .eq('title', 'Test Event');
        console.log('✅ Test data cleaned up');
      }
    } else {
      console.log('Table schema:', schemaData);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection();
