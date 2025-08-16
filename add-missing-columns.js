// Add missing columns to database
// Run with: node add-missing-columns.js

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

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to events table...');
    
    // Add the missing column using SQL
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          ALTER TABLE public.events 
          ADD COLUMN IF NOT EXISTS punishment_severity integer DEFAULT 5;
          
          -- Update existing records to have default value
          UPDATE public.events 
          SET punishment_severity = 5 
          WHERE punishment_severity IS NULL;
        `
      });
    
    if (error) {
      console.error('Error adding column:', error);
      
      // Try alternative approach - direct SQL execution
      console.log('Trying alternative approach...');
      
      // Since we can't use rpc, let's test if the column exists by trying to insert
      const testData = {
        title: 'Test Event for Column Check',
        date: '2024-01-01',
        time: '12:00',
        location: 'Test Location',
        event_type: 'in-person',
        event_details: 'Test details',
        decision_mode: 'single_person',
        punishment: 'Test punishment',
        invited_by: 'test@example.com',
        status: 'active'
        // Note: Not including punishment_severity to see if it's optional
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('events')
        .insert(testData)
        .select();
      
      if (insertError) {
        console.error('❌ Insert failed:', insertError);
        console.log('\n🔧 Manual fix required:');
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
      } else {
        console.log('✅ Insert successful without punishment_severity');
        console.log('The column might be optional or have a default value');
        
        // Clean up test data
        await supabase
          .from('events')
          .delete()
          .eq('title', 'Test Event for Column Check');
      }
    } else {
      console.log('✅ Column added successfully');
    }
    
  } catch (error) {
    console.error('Script failed:', error);
  }
}

addMissingColumns();
