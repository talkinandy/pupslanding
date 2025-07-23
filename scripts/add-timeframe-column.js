#!/usr/bin/env node

/**
 * Add timeframe column to trader_snapshots table
 */

const { createClient } = require('@supabase/supabase-js');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addTimeframeColumn() {
  console.log('🔧 Adding timeframe column to trader_snapshots table...');
  
  try {
    // Add timeframe column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE trader_snapshots ADD COLUMN IF NOT EXISTS timeframe VARCHAR(10);'
    });
    
    if (alterError) {
      console.log('   Trying alternative method...');
      
      // Alternative: try to use raw SQL execution
      const { error: execError } = await supabase
        .from('trader_snapshots')
        .select('timeframe')
        .limit(1);
      
      if (execError && execError.message.includes('column "timeframe" does not exist')) {
        console.log('   ✅ Column needs to be added manually');
        console.log('   📋 Please run this SQL in Supabase dashboard:');
        console.log('   ALTER TABLE trader_snapshots ADD COLUMN timeframe VARCHAR(10);');
        console.log('   CREATE INDEX idx_trader_snapshots_timeframe ON trader_snapshots(timeframe, snapshot_date);');
        return false;
      } else if (!execError) {
        console.log('   ✅ Column already exists');
        return true;
      }
    } else {
      console.log('   ✅ Column added successfully');
    }
    
    // Add index
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_trader_snapshots_timeframe ON trader_snapshots(timeframe, snapshot_date);'
    });
    
    if (!indexError) {
      console.log('   ✅ Index created successfully');
    }
    
    return true;
    
  } catch (error) {
    console.error('   ❌ Failed to add column:', error.message);
    return false;
  }
}

async function testTimeframeColumn() {
  console.log('\n🧪 Testing timeframe column...');
  
  try {
    // Try to insert a test record with timeframe
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('trader_snapshots')
      .select('timeframe')
      .limit(1);
    
    if (error) {
      console.log('   ❌ Column not available:', error.message);
      return false;
    } else {
      console.log('   ✅ Column is accessible');
      return true;
    }
    
  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Database Schema Update');
  console.log('========================\n');
  
  const columnAdded = await addTimeframeColumn();
  
  if (columnAdded) {
    const columnWorks = await testTimeframeColumn();
    
    if (columnWorks) {
      console.log('\n✅ SUCCESS: Database ready for timeframe data');
      console.log('   Next: Update the leaderboard script to store timeframe-specific data');
    } else {
      console.log('\n⚠️  Column may need manual addition in Supabase dashboard');
    }
  } else {
    console.log('\n📋 MANUAL STEPS REQUIRED:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Run: ALTER TABLE trader_snapshots ADD COLUMN timeframe VARCHAR(10);');
    console.log('3. Run: CREATE INDEX idx_trader_snapshots_timeframe ON trader_snapshots(timeframe, snapshot_date);');
  }
}

if (require.main === module) {
  main();
}