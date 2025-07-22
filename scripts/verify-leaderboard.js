#!/usr/bin/env node

/**
 * Leaderboard Verification Script
 * Verifies that the leaderboard update was successful
 * Runs after the main update script
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Verify leaderboard data integrity
 */
async function verifyLeaderboard() {
  try {
    console.log('🔍 Verifying leaderboard data...');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today's snapshots exist
    const { data: snapshots, error: snapshotsError } = await supabase
      .from('trader_snapshots')
      .select('count(*)')
      .eq('snapshot_date', today)
      .single();

    if (snapshotsError) {
      throw snapshotsError;
    }

    const snapshotCount = snapshots.count;
    console.log(`   Found ${snapshotCount} trader snapshots for today`);
    
    if (snapshotCount === 0) {
      throw new Error('No trader snapshots found for today');
    }

    // Check if platform stats exist
    const { data: stats, error: statsError } = await supabase
      .from('platform_stats')
      .select('*')
      .eq('stat_date', today)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      throw statsError;
    }

    if (stats) {
      console.log(`   Platform stats updated: ${stats.total_traders.toLocaleString()} traders, ${stats.daily_volume} BTC volume`);
    } else {
      console.log('   ⚠️  Platform stats not found (non-critical)');
    }

    // Verify leaderboard view is accessible
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(5);

    if (leaderboardError) {
      throw leaderboardError;
    }

    if (leaderboard && leaderboard.length > 0) {
      console.log(`   Top trader: ${leaderboard[0].name} with ${leaderboard[0].total_pnl} BTC P&L`);
    }

    console.log('✅ Leaderboard verification passed');
    
    return {
      snapshotCount,
      hasStats: !!stats,
      topTrader: leaderboard?.[0]?.name || 'Unknown'
    };
    
  } catch (error) {
    console.error('❌ Leaderboard verification failed:', error.message);
    throw error;
  }
}

/**
 * Check data freshness
 */
async function checkDataFreshness() {
  try {
    console.log('⏰ Checking data freshness...');
    
    const { data: latestSnapshot, error } = await supabase
      .from('trader_snapshots')
      .select('snapshot_date')
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!latestSnapshot) {
      console.log('   ⚠️  No snapshots found in database');
      return false;
    }

    const latestDate = new Date(latestSnapshot.snapshot_date);
    const today = new Date();
    const daysDiff = Math.floor((today - latestDate) / (1000 * 60 * 60 * 24));
    
    console.log(`   Latest snapshot: ${latestSnapshot.snapshot_date} (${daysDiff} days ago)`);
    
    if (daysDiff > 1) {
      console.log('   ⚠️  Data is more than 1 day old');
      return false;
    }
    
    console.log('✅ Data is fresh');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to check data freshness:', error.message);
    return false;
  }
}

/**
 * Main verification function
 */
async function main() {
  try {
    console.log('🔍 Starting leaderboard verification...');
    
    const [verification, freshness] = await Promise.all([
      verifyLeaderboard(),
      checkDataFreshness()
    ]);
    
    console.log('\n📊 Verification Summary:');
    console.log(`   Snapshots: ${verification.snapshotCount}`);
    console.log(`   Platform stats: ${verification.hasStats ? 'Updated' : 'Missing'}`);
    console.log(`   Top trader: ${verification.topTrader}`);
    console.log(`   Data freshness: ${freshness ? 'Fresh' : 'Stale'}`);
    
    if (verification.snapshotCount > 0 && freshness) {
      console.log('✅ All verification checks passed');
    } else {
      console.log('⚠️  Some verification checks failed (check logs above)');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Verification process failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  main,
  verifyLeaderboard,
  checkDataFreshness
};