#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample trader data matching the mock data format
const sampleTraders = [
  { principal: 'trader_1', name: '金π丨铁军丨白丁' },
  { principal: 'trader_2', name: '1000PI' },
  { principal: 'trader_3', name: 'Mysterious Diviner' },
  { principal: 'trader_4', name: '金π丨铁军丨onepiece' },
  { principal: 'trader_5', name: '钻石手💎uokdzz' },
  { principal: 'trader_6', name: 'Bitcoin Maximalist' },
  { principal: 'trader_7', name: 'DeFi Degen' },
  { principal: 'trader_8', name: 'Rune Hunter' },
  { principal: 'trader_9', name: 'Crypto Wizard' },
  { principal: 'trader_10', name: 'Diamond Hands' }
];

async function seedSampleData() {
  console.log('🌱 Seeding sample data for testing...');
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await supabase.from('trader_snapshots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('trader_positions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('traders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('platform_stats').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert traders
    console.log('👥 Inserting sample traders...');
    const { data: tradersData, error: tradersError } = await supabase
      .from('traders')
      .insert(sampleTraders)
      .select();

    if (tradersError) {
      console.error('Error inserting traders:', tradersError);
      return;
    }

    // Insert trader snapshots (current day)
    console.log('📊 Inserting trader snapshots...');
    const snapshots = tradersData.map((trader, index) => {
      const realizedPnl = (Math.random() * 5 - 2.5); // Random between -2.5 and 2.5 BTC
      const unrealizedPnl = (Math.random() * 2 - 1); // Random between -1 and 1 BTC
      const totalPnl = realizedPnl + unrealizedPnl;
      
      return {
        trader_id: trader.id,
        realized_pnl: Number(realizedPnl.toFixed(8)),
        unrealized_pnl: Number(unrealizedPnl.toFixed(8)),
        total_pnl: Number(totalPnl.toFixed(8)),
        rank: index + 1,
        snapshot_date: new Date().toISOString().split('T')[0] // Today
      };
    }).sort((a, b) => b.total_pnl - a.total_pnl) // Sort by total PnL desc
      .map((snapshot, index) => ({ ...snapshot, rank: index + 1 })); // Re-rank

    const { error: snapshotsError } = await supabase
      .from('trader_snapshots')
      .insert(snapshots);

    if (snapshotsError) {
      console.error('Error inserting snapshots:', snapshotsError);
      return;
    }

    // Insert platform stats
    console.log('📈 Inserting platform stats...');
    const { error: statsError } = await supabase
      .from('platform_stats')
      .insert({
        stat_date: new Date().toISOString().split('T')[0],
        total_volume: 50.97,
        total_traders: tradersData.length,
        active_traders: Math.floor(tradersData.length * 0.8),
        btc_price: 119292.125
      });

    if (statsError) {
      console.error('Error inserting platform stats:', statsError);
      return;
    }

    // Refresh materialized view
    console.log('🔄 Refreshing leaderboard view...');
    await supabase.rpc('refresh_leaderboard');

    console.log('✅ Sample data seeded successfully!');
    console.log(`👥 Created ${tradersData.length} traders`);
    console.log(`📊 Added ${snapshots.length} snapshots`);
    console.log('🎯 Dashboard is ready to test!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedSampleData().catch(console.error);