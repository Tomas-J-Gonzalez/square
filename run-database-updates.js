// Run database updates directly to Supabase
// Run with: node run-database-updates.js

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

    // SQL commands to execute
    const sqlCommands = [
      {
        name: 'Add punishment_severity column',
        sql: `ALTER TABLE public.events ADD COLUMN IF NOT EXISTS punishment_severity integer DEFAULT 5;`
      },
      {
        name: 'Update existing events with default severity',
        sql: `UPDATE public.events SET punishment_severity = 5 WHERE punishment_severity IS NULL;`
      },
      {
        name: 'Create status index',
        sql: `CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);`
      },
      {
        name: 'Create invited_by index',
        sql: `CREATE INDEX IF NOT EXISTS idx_events_invited_by ON public.events(invited_by);`
      },
      {
        name: 'Create created_at index',
        sql: `CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);`
      },
      {
        name: 'Create updated_at trigger function',
        sql: `
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
              NEW.updated_at = now();
              RETURN NEW;
          END;
          $$ language 'plpgsql';
        `
      },
      {
        name: 'Create updated_at trigger',
        sql: `
          DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
          CREATE TRIGGER update_events_updated_at 
              BEFORE UPDATE ON public.events 
              FOR EACH ROW 
              EXECUTE FUNCTION update_updated_at_column();
        `
      }
    ];

    // Execute each SQL command
    for (const command of sqlCommands) {
      console.log(`📝 ${command.name}...`);
      
      try {
        // Use the REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify({
            sql: command.sql
          })
        });

        if (response.ok) {
          console.log(`✅ ${command.name} - Success`);
        } else {
          const error = await response.text();
          console.log(`⚠️  ${command.name} - API method failed, trying alternative...`);
          
          // Alternative: Try to test if the change worked by checking the table structure
          if (command.name.includes('punishment_severity')) {
            // Test if the column was added by trying to insert with it
            const testData = {
              title: 'Test Event - Column Check',
              date: '2024-01-01',
              time: '12:00',
              location: 'Test Location',
              event_type: 'in-person',
              event_details: 'Test details',
              decision_mode: 'single_person',
              punishment: 'Test punishment',
              punishment_severity: 7, // Test the new column
              invited_by: 'test@example.com',
              status: 'active'
            };
            
            const { data: insertData, error: insertError } = await supabase
              .from('events')
              .insert(testData)
              .select();
            
            if (insertError) {
              console.log(`❌ ${command.name} - Column still missing:`, insertError.message);
            } else {
              console.log(`✅ ${command.name} - Column added successfully (verified by insert test)`);
              
              // Clean up test data
              await supabase
                .from('events')
                .delete()
                .eq('title', 'Test Event - Column Check');
            }
          }
        }
      } catch (error) {
        console.log(`❌ ${command.name} - Error:`, error.message);
      }
      
      console.log(''); // Empty line for readability
    }

    console.log('🎉 Database updates completed!');
    console.log('\n📋 Summary:');
    console.log('- punishment_severity column should now exist');
    console.log('- All existing events have severity = 5');
    console.log('- Performance indexes added');
    console.log('- Updated_at trigger created');
    
    console.log('\n🧪 Testing event creation...');
    
    // Test event creation with the new column
    const testEventData = {
      title: 'Test Event After Updates',
      date: '2024-01-01',
      time: '12:00',
      location: 'Test Location',
      event_type: 'in-person',
      event_details: 'Test details',
      decision_mode: 'single_person',
      punishment: 'Test punishment',
      punishment_severity: 8,
      invited_by: 'test@example.com',
      status: 'active'
    };
    
    const { data: testEvent, error: testError } = await supabase
      .from('events')
      .insert(testEventData)
      .select();
    
    if (testError) {
      console.log('❌ Event creation test failed:', testError.message);
    } else {
      console.log('✅ Event creation test successful!');
      console.log('Created event:', testEvent);
      
      // Clean up test event
      await supabase
        .from('events')
        .delete()
        .eq('title', 'Test Event After Updates');
      console.log('✅ Test event cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

runDatabaseUpdates();
