#!/usr/bin/env node

/**
 * Leaderboard Update Script
 * Fetches top traders from Odin API and updates Supabase
 * Runs daily via GitHub Actions
 */

const { createClient } = require('@supabase/supabase-js');

// Environment validation
const requiredEnvs = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

for (const env of requiredEnvs) {
  if (!process.env[env]) {
    console.error(`❌ Missing required environment variable: ${env}`);
    process.exit(1);
  }
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Odin API configuration
const ODIN_API_BASE = 'https://api.odin.fun/v1';

/**
 * Convert millisatoshis to BTC
 */
function millisatsToBTC(millisats) {
  return parseInt(millisats) / 100_000_000_000;
}

/**
 * Fetch platform stats from Odin API
 */
async function fetchOdinStats() {
  try {
    console.log('📊 Fetching platform stats from Odin API...');
    
    const response = await fetch(`${ODIN_API_BASE}/statistics/dashboard`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PUPS-Dashboard/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Odin API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Platform stats: ${data.total_users.toLocaleString()} users, ${millisatsToBTC(data.total_volume_24h).toFixed(2)} BTC daily volume`);
    
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch Odin stats:', error.message);
    throw error;
  }
}

/**
 * Fetch real traders from Odin API
 * Gets users, calculates performance from trades/stats
 */
async function fetchTopTraders(limit = 100) {
  try {
    console.log(`👥 Fetching real trader data for top ${limit} traders...`);
    
    // Step 1: Get active users by analyzing recent trades
    console.log('   📊 Fetching recent trading activity...');
    const recentTradesResponse = await fetch(`${ODIN_API_BASE}/trades?limit=1000`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PUPS-Dashboard/1.0'
      }
    });
    
    if (!recentTradesResponse.ok) {
      throw new Error(`Failed to fetch recent trades: ${recentTradesResponse.status}`);
    }
    
    const tradesData = await recentTradesResponse.json();
    console.log(`   📈 Analyzed ${tradesData.data.length} recent trades`);
    
    // Step 2: Aggregate trading data by user
    const traderStats = new Map();
    
    for (const trade of tradesData.data) {
      const principal = trade.user;
      const amountBtc = millisatsToBTC(trade.amount_btc);
      const username = trade.user_username || principal.slice(0, 8);
      
      if (!traderStats.has(principal)) {
        traderStats.set(principal, {
          principal,
          name: username,
          total_volume: 0,
          trade_count: 0,
          buy_volume: 0,
          sell_volume: 0,
          last_active: trade.time
        });
      }
      
      const stats = traderStats.get(principal);
      stats.total_volume += amountBtc;
      stats.trade_count += 1;
      
      if (trade.buy) {
        stats.buy_volume += amountBtc;
      } else {
        stats.sell_volume += amountBtc;
      }
      
      // Update last active time if this trade is more recent
      if (new Date(trade.time) > new Date(stats.last_active)) {
        stats.last_active = trade.time;
      }
    }
    
    console.log(`   👥 Found ${traderStats.size} unique active traders`);
    
    // Step 3: Get detailed stats for top traders by volume
    const topTradersByVolume = Array.from(traderStats.values())
      .sort((a, b) => b.total_volume - a.total_volume)
      .slice(0, Math.min(limit * 2, 500)); // Get 2x limit to account for users with no asset value
    
    console.log(`   🔍 Fetching detailed stats for top ${topTradersByVolume.length} traders...`);
    
    const traders = [];
    const batchSize = 10; // Process in batches to avoid overwhelming API
    
    for (let i = 0; i < topTradersByVolume.length && traders.length < limit; i += batchSize) {
      const batch = topTradersByVolume.slice(i, i + batchSize);
      const batchPromises = batch.map(async (trader) => {
        try {
          const statsResponse = await fetch(`${ODIN_API_BASE}/user/${trader.principal}/stats`, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'PUPS-Dashboard/1.0'
            }
          });
          
          if (!statsResponse.ok) {
            return null;
          }
          
          const statsData = await statsResponse.json();
          const userStats = statsData.data;
          
          // Calculate performance metrics
          const totalAssetValue = millisatsToBTC(userStats.total_asset_value || 0);
          const totalLiquidity = millisatsToBTC(userStats.total_liquidity || 0);
          const btcBalance = millisatsToBTC(userStats.btc || 0);
          
          // Estimate P&L based on asset value vs trading volume
          const estimatedInvested = trader.buy_volume;
          const currentValue = totalAssetValue + totalLiquidity + btcBalance;
          const estimatedPnl = currentValue - estimatedInvested;
          
          return {
            principal: trader.principal,
            name: trader.name,
            realized_pnl: trader.sell_volume - trader.buy_volume, // Net from selling
            unrealized_pnl: estimatedPnl - (trader.sell_volume - trader.buy_volume),
            total_pnl: estimatedPnl,
            volume_24h: trader.total_volume,
            last_active: trader.last_active,
            trade_count: trader.trade_count
          };
        } catch (error) {
          console.error(`   ❌ Failed to fetch stats for ${trader.principal}:`, error.message);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(result => 
        result && 
        (result.total_pnl !== 0 || result.volume_24h > 0.001) // Filter out inactive users
      );
      
      traders.push(...validResults);
      
      console.log(`   📊 Processed batch ${Math.floor(i/batchSize) + 1}: ${validResults.length}/${batch.length} valid traders`);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Step 4: Sort by total P&L and assign ranks
    traders.sort((a, b) => b.total_pnl - a.total_pnl);
    
    const finalTraders = traders.slice(0, limit).map((trader, index) => ({
      ...trader,
      rank: index + 1,
      realized_pnl: Number(trader.realized_pnl.toFixed(8)),
      unrealized_pnl: Number(trader.unrealized_pnl.toFixed(8)),
      total_pnl: Number(trader.total_pnl.toFixed(8)),
      volume_24h: Number(trader.volume_24h.toFixed(8))
    }));

    console.log(`✅ Fetched ${finalTraders.length} real traders from Odin API`);
    if (finalTraders.length > 0) {
      console.log(`   🏆 Top trader: ${finalTraders[0].name} with ${finalTraders[0].total_pnl.toFixed(8)} BTC P&L`);
      console.log(`   📈 Average volume: ${(finalTraders.reduce((sum, t) => sum + t.volume_24h, 0) / finalTraders.length).toFixed(4)} BTC`);
    }
    
    return finalTraders;
  } catch (error) {
    console.error('❌ Failed to fetch real traders from Odin API:', error.message);
    throw error;
  }
}

/**
 * Update platform stats in database
 */
async function updatePlatformStats(odinStats) {
  try {
    console.log('📈 Updating platform stats...');
    
    const statsRecord = {
      stat_date: new Date().toISOString().split('T')[0], // Today's date
      total_traders: odinStats.total_users,
      total_volume: millisatsToBTC(odinStats.total_volume_24h).toFixed(8), // Use daily volume for our schema
      active_traders: Math.floor(odinStats.total_users * 0.1), // Estimate 10% active
      btc_price: 100000 // Placeholder BTC price
    };

    const { error } = await supabase
      .from('platform_stats')
      .upsert(statsRecord, { 
        onConflict: 'stat_date',
        ignoreDuplicates: false 
      });

    if (error) {
      throw error;
    }

    console.log('✅ Platform stats updated successfully');
  } catch (error) {
    console.error('❌ Failed to update platform stats:', error.message);
    throw error;
  }
}

/**
 * Update traders and snapshots in database
 */
async function updateLeaderboard(traders) {
  try {
    console.log('🏆 Updating leaderboard...');
    
    const today = new Date().toISOString().split('T')[0];
    
    // First, ensure all traders exist in the traders table
    const traderRecords = traders.map(trader => ({
      principal: trader.principal,
      name: trader.name
    }));

    console.log(`   Upserting ${traderRecords.length} trader records...`);
    const { error: tradersError } = await supabase
      .from('traders')
      .upsert(traderRecords, { 
        onConflict: 'principal',
        ignoreDuplicates: false 
      });

    if (tradersError) {
      throw tradersError;
    }

    // Get all trader UUIDs for the snapshots
    const { data: existingTraders, error: fetchError } = await supabase
      .from('traders')
      .select('id, principal')
      .in('principal', traders.map(t => t.principal));
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Create a map of principal to UUID
    const principalToId = new Map();
    existingTraders.forEach(trader => {
      principalToId.set(trader.principal, trader.id);
    });
    
    // Then create daily snapshots with proper trader_id
    const snapshotRecords = traders.map(trader => ({
      trader_id: principalToId.get(trader.principal),
      snapshot_date: today,
      realized_pnl: trader.realized_pnl,
      unrealized_pnl: trader.unrealized_pnl,
      total_pnl: trader.total_pnl,
      rank: trader.rank
    })).filter(record => record.trader_id); // Only include if we have a valid trader_id

    console.log(`   Inserting ${snapshotRecords.length} snapshot records...`);
    
    // First, delete existing snapshots for today to avoid duplicates
    const { error: deleteError } = await supabase
      .from('trader_snapshots')
      .delete()
      .eq('snapshot_date', today)
      .in('trader_id', snapshotRecords.map(r => r.trader_id));
    
    if (deleteError) {
      console.error('Warning: Could not delete existing snapshots:', deleteError.message);
    }
    
    // Then insert new snapshots
    const { error: snapshotsError } = await supabase
      .from('trader_snapshots')
      .insert(snapshotRecords);

    if (snapshotsError) {
      throw snapshotsError;
    }

    console.log('✅ Leaderboard updated successfully');
  } catch (error) {
    console.error('❌ Failed to update leaderboard:', error.message);
    throw error;
  }
}

/**
 * Refresh materialized view for fast queries
 */
async function refreshLeaderboardView() {
  try {
    console.log('🔄 Refreshing leaderboard materialized view...');
    
    const { error } = await supabase.rpc('refresh_leaderboard');
    
    if (error) {
      throw error;
    }

    console.log('✅ Leaderboard view refreshed');
  } catch (error) {
    console.error('❌ Failed to refresh leaderboard view:', error.message);
    // Don't throw - this is non-critical
  }
}

/**
 * Clean up old data to save storage
 */
async function cleanupOldData() {
  try {
    console.log('🧹 Cleaning up old data...');
    
    // Delete snapshots older than 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    
    const { error } = await supabase
      .from('trader_snapshots')
      .delete()
      .lt('snapshot_date', cutoffDate.toISOString().split('T')[0]);

    if (error) {
      throw error;
    }

    console.log('✅ Old data cleaned up');
  } catch (error) {
    console.error('❌ Failed to cleanup old data:', error.message);
    // Don't throw - this is non-critical
  }
}

/**
 * Main execution function
 */
async function main() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting leaderboard update process...');
    console.log(`   Time: ${new Date().toISOString()}`);
    
    // Fetch data from Odin API
    const [odinStats, traders] = await Promise.all([
      fetchOdinStats(),
      fetchTopTraders(100)
    ]);
    
    // Update database
    await Promise.all([
      updatePlatformStats(odinStats),
      updateLeaderboard(traders)
    ]);
    
    // Refresh views and cleanup (non-blocking)
    await Promise.all([
      refreshLeaderboardView(),
      cleanupOldData()
    ]);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Leaderboard update completed successfully in ${duration}s`);
    console.log(`   Updated ${traders.length} traders`);
    console.log(`   Platform volume: ${millisatsToBTC(odinStats.total_volume_24h).toFixed(2)} BTC`);
    
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`❌ Leaderboard update failed after ${duration}s:`, error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  main,
  fetchOdinStats,
  fetchTopTraders,
  updatePlatformStats,
  updateLeaderboard
};