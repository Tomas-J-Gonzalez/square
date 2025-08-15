/**
 * Detailed Database Inspection Script
 * 
 * This script performs a detailed inspection of your database to identify specific issues.
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

async function detailedInspect() {
  console.log('🔍 Detailed Database Inspection...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('📋 Checking email_confirmations table structure...\n');

    // Check email_confirmations columns
    try {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', 'email_confirmations')
        .order('ordinal_position');

      if (columnsError) {
        console.log('❌ Error fetching columns:', columnsError.message);
      } else {
        console.log('📊 email_confirmations columns:');
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });

        // Check for missing columns
        const columnNames = columns.map(col => col.column_name);
        const requiredColumns = ['id', 'token', 'user_id', 'email', 'used', 'expires_at', 'created_at'];
        
        console.log('\n🔍 Checking for missing columns:');
        requiredColumns.forEach(col => {
          const exists = columnNames.includes(col);
          console.log(`  ${exists ? '✅' : '❌'} ${col}: ${exists ? 'EXISTS' : 'MISSING'}`);
        });
      }
    } catch (error) {
      console.log('❌ Error checking email_confirmations structure:', error.message);
    }

    console.log('\n📋 Testing user registration flow...\n');

    // Test user creation
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const testName = 'Test User';
      const testPassword = 'TestPassword123!';

      console.log(`🧪 Creating test user: ${testEmail}`);

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: testEmail,
          name: testName,
          password_hash: 'test_hash',
          email_confirmed: false
        })
        .select('id, email, name, email_confirmed')
        .single();

      if (createError) {
        console.log('❌ User creation failed:', createError.message);
        console.log('   This might be due to missing RLS policies or permission issues.');
      } else {
        console.log('✅ User creation successful:', newUser);

        // Test confirmation token creation
        try {
          const testToken = `test-token-${Date.now()}`;
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

          console.log(`🧪 Creating test confirmation token for user: ${newUser.id}`);

          const { data: confirmation, error: tokenError } = await supabase
            .from('email_confirmations')
            .insert({
              token: testToken,
              user_id: newUser.id,
              email: testEmail,
              expires_at: expiresAt.toISOString(),
              used: false
            })
            .select('id, token, user_id, email, used, expires_at')
            .single();

          if (tokenError) {
            console.log('❌ Confirmation token creation failed:', tokenError.message);
            console.log('   This might be due to missing user_id column or foreign key issues.');
          } else {
            console.log('✅ Confirmation token creation successful:', confirmation);
          }

          // Clean up test data
          try {
            await supabase.from('email_confirmations').delete().eq('id', confirmation.id);
            await supabase.from('users').delete().eq('id', newUser.id);
            console.log('🧹 Test data cleaned up');
          } catch (cleanupError) {
            console.log('⚠️ Cleanup error (non-critical):', cleanupError.message);
          }

        } catch (tokenError) {
          console.log('❌ Token creation error:', tokenError.message);
        }
      }
    } catch (error) {
      console.log('❌ User creation test error:', error.message);
    }

    console.log('\n📋 Checking RLS policies...\n');

    // Check RLS policies
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('tablename, policyname, cmd')
        .eq('schemaname', 'public')
        .in('tablename', ['users', 'email_confirmations', 'events', 'event_rsvps']);

      if (policiesError) {
        console.log('❌ Error fetching policies:', policiesError.message);
      } else {
        console.log('🔒 Current RLS policies:');
        const tablePolicies = {};
        policies.forEach(policy => {
          if (!tablePolicies[policy.tablename]) {
            tablePolicies[policy.tablename] = [];
          }
          tablePolicies[policy.tablename].push(`${policy.policyname} (${policy.cmd})`);
        });

        ['users', 'email_confirmations', 'events', 'event_rsvps'].forEach(table => {
          const tablePolicyList = tablePolicies[table] || [];
          console.log(`  ${table}: ${tablePolicyList.length > 0 ? tablePolicyList.join(', ') : 'NO POLICIES'}`);
        });
      }
    } catch (error) {
      console.log('❌ Error checking RLS policies:', error.message);
    }

    console.log('\n🎉 Detailed inspection completed!');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

// Run the detailed inspection
detailedInspect().catch(console.error);
