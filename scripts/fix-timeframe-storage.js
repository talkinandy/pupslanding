#!/usr/bin/env node

/**
 * Script to test storing separate timeframe data in database
 */

const { createClient } = require('@supabase/supabase-js');

// Environment validation
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCurrentSchema() {
  console.log('🔍 Checking current database schema...');
  
  try {
    // Check trader_snapshots table structure
    const { data, error } = await supabase
      .rpc('get_table_schema', { table_name: 'trader_snapshots' });
    
    if (error) {
      console.log('   Using alternative method to check schema...');
      
      // Try to get a sample record to see the structure
      const { data: sampleData, error: sampleError } = await supabase
        .from('trader_snapshots')
        .select('*')
        .limit(1);
      
      if (sampleData && sampleData.length > 0) {
        console.log('   Current trader_snapshots columns:', Object.keys(sampleData[0]));
      }
    } else {
      console.log('   Schema data:', data);
    }
  } catch (error) {
    console.error('   ❌ Schema check failed:', error.message);
  }
}

async function proposeSchema() {
  console.log('\n💡 Proposed Solution:');
  console.log('===================');
  console.log('Option 1: Add timeframe column to trader_snapshots');
  console.log('   - Add column: timeframe (24h, 7d, 30d)');
  console.log('   - Store separate records per timeframe');
  console.log('   - Filter by timeframe in queries');
  
  console.log('\nOption 2: Use separate tables per timeframe');
  console.log('   - trader_snapshots_24h');
  console.log('   - trader_snapshots_7d');  
  console.log('   - trader_snapshots_30d');
  
  console.log('\nOption 3: Store timeframe data in JSON column');
  console.log('   - Add column: timeframe_data (JSON)');
  console.log('   - Store all timeframes in one record');
  
  console.log('\n🎯 RECOMMENDATION: Option 1 (Add timeframe column)');
  console.log('   - Simple and clean');
  console.log('   - Easy to query');
  console.log('   - Maintains existing structure');
  
  return 'timeframe_column';
}

async function testTimeframeStorage() {
  console.log('\n🧪 Testing timeframe storage approach...');
  
  // Check if we can add a timeframe filter to existing queries
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Test query with all current data 
    const { data: allData, error } = await supabase
      .from('trader_snapshots')
      .select('trader_id, realized_pnl, unrealized_pnl, total_pnl, rank')
      .eq('snapshot_date', today)
      .limit(10);
    
    if (error) throw error;
    
    console.log(`   ✅ Current data: ${allData.length} records`);
    
    // Show how we could separate them by performance metrics
    console.log('\n   📊 How data could be separated by timeframe:');
    
    if (allData.length > 0) {
      // Simulate 24h (sort by realized_pnl)
      const sim24h = [...allData].sort((a, b) => b.realized_pnl - a.realized_pnl).slice(0, 5);
      console.log('   24h top 5 (by realized P&L):');
      sim24h.forEach((trader, i) => {
        console.log(`      ${i + 1}. Trader ${trader.trader_id}: ${trader.realized_pnl} BTC`);
      });
      
      // Simulate 7d (sort by total_pnl)  
      const sim7d = [...allData].sort((a, b) => b.total_pnl - a.total_pnl).slice(0, 5);
      console.log('   7d top 5 (by total P&L):');
      sim7d.forEach((trader, i) => {
        console.log(`      ${i + 1}. Trader ${trader.trader_id}: ${trader.total_pnl} BTC`);
      });
      
      // Check if rankings are different
      const rankings24h = sim24h.map(t => t.trader_id);
      const rankings7d = sim7d.map(t => t.trader_id);
      const isDifferent = JSON.stringify(rankings24h) !== JSON.stringify(rankings7d);
      
      console.log(`   🎯 Rankings different: ${isDifferent ? 'YES' : 'NO'}`);
    }
    
  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
  }
}

async function main() {
  console.log('🔧 Timeframe Storage Analysis');
  console.log('============================\n');
  
  await checkCurrentSchema();
  const solution = await proposeSchema();
  await testTimeframeStorage();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('=============');
  console.log('1. Add timeframe column to trader_snapshots table');
  console.log('2. Modify update script to store data for each timeframe');
  console.log('3. Update frontend to load timeframe-specific data');
  console.log('4. Test with real data to ensure different rankings');
  
  console.log('\n📋 SQL to add timeframe column:');
  console.log('ALTER TABLE trader_snapshots ADD COLUMN timeframe VARCHAR(10);');
  console.log('CREATE INDEX idx_trader_snapshots_timeframe ON trader_snapshots(timeframe, snapshot_date);');
}

if (require.main === module) {
  main();
}