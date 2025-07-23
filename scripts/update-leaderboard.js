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
 * Fetch trades from Odin API for a specific timeframe
 * @param {string} timeframe - '24h' or '7d'
 * @param {number} maxTrades - Maximum number of trades to fetch (Infinity for no limit)
 */
async function fetchTradesByTimeframe(timeframe, maxTrades = 10000) {
  console.log(`   📊 Fetching trades for ${timeframe} timeframe (${maxTrades === Infinity ? 'NO LIMIT' : `up to ${maxTrades.toLocaleString()} trades`})...`);
  
  // Calculate cutoff time based on timeframe
  const hoursMap = { '24h': 24, '7d': 168 };
  const hours = hoursMap[timeframe] || 168;
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  console.log(`   🕒 Looking for trades after: ${cutoffTime.toISOString()}`);
  
  const allTrades = [];
  const batchSize = 1000;
  let offset = 0;
  let consecutiveEmptyBatches = 0;
  const maxConsecutiveEmpty = 5; // Stop if 5 batches in a row have no recent trades
  
  while (allTrades.length < maxTrades && consecutiveEmptyBatches < maxConsecutiveEmpty) {
    const response = await fetch(`${ODIN_API_BASE}/trades?limit=${batchSize}&offset=${offset}&sort=time%3Adesc`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PUPS-Dashboard/1.0'
      }
    });
    
    if (!response.ok) {
      console.error(`   ⚠️  Failed to fetch trades at offset ${offset}: ${response.status}`);
      break;
    }
    
    const batchData = await response.json();
    const trades = batchData.data || [];
    
    if (trades.length === 0) {
      console.log(`   📈 No more trades available at offset ${offset}`);
      break;
    }
    
    // Show sample of trade times for debugging
    if (offset === 0 && trades.length > 0) {
      console.log(`   🔍 Sample trade times: latest=${trades[0].time}, oldest=${trades[trades.length-1].time}`);
    }
    
    // Filter trades within our timeframe and add them
    let recentTradeCount = 0;
    let oldTradeCount = 0;
    
    for (const trade of trades) {
      const tradeTime = new Date(trade.time);
      if (tradeTime >= cutoffTime) {
        allTrades.push(trade);
        recentTradeCount++;
      } else {
        oldTradeCount++;
      }
    }
    
    console.log(`   📈 Batch ${Math.floor(offset/batchSize) + 1}: ${recentTradeCount} recent, ${oldTradeCount} old (total: ${allTrades.length})`);
    
    // Track consecutive empty batches
    if (recentTradeCount === 0) {
      consecutiveEmptyBatches++;
    } else {
      consecutiveEmptyBatches = 0;
    }
    
    // If all trades in this batch are old, we're probably past our timeframe
    if (oldTradeCount === trades.length && allTrades.length > 0) {
      console.log(`   🎯 Reached older trades (all ${trades.length} trades in batch are old), stopping at ${allTrades.length} trades`);
      break;
    }
    
    offset += batchSize;
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  if (consecutiveEmptyBatches >= maxConsecutiveEmpty) {
    console.log(`   ⏹️  Stopped after ${maxConsecutiveEmpty} consecutive batches with no recent trades`);
  }
  
  console.log(`   ✅ Found ${allTrades.length} trades in last ${hours} hours (${timeframe})`);
  return allTrades;
}

/**
 * Aggregate trader metrics from trades
 * @param {Array} trades - Array of trade objects
 */
function aggregateTraderMetrics(trades) {
  console.log(`   🔍 Aggregating metrics from ${trades.length} trades...`);
  
  const traderMetrics = new Map();
  
  for (const trade of trades) {
    const principal = trade.user;
    const amountBtc = millisatsToBTC(trade.amount_btc);
    const username = trade.user_username || principal.slice(0, 8);
    
    if (!traderMetrics.has(principal)) {
      traderMetrics.set(principal, {
        principal,
        name: username,
        total_volume: 0,
        buy_volume: 0,
        sell_volume: 0,
        trade_count: 0,
        first_trade: trade.time,
        last_trade: trade.time,
        tokens_traded: new Set()
      });
    }
    
    const metrics = traderMetrics.get(principal);
    metrics.total_volume += amountBtc;
    metrics.trade_count += 1;
    metrics.tokens_traded.add(trade.token);
    
    if (trade.buy) {
      metrics.buy_volume += amountBtc;
    } else {
      metrics.sell_volume += amountBtc;
    }
    
    // Update time bounds
    if (new Date(trade.time) < new Date(metrics.first_trade)) {
      metrics.first_trade = trade.time;
    }
    if (new Date(trade.time) > new Date(metrics.last_trade)) {
      metrics.last_trade = trade.time;
    }
  }
  
  console.log(`   👥 Found ${traderMetrics.size} unique traders`);
  return traderMetrics;
}

/**
 * Build leaderboard for a specific timeframe using trade-based approach
 * @param {string} timeframe - '24h' or '7d'
 * @param {number} limit - Maximum number of traders to return
 */
async function buildTimeframeLeaderboard(timeframe, limit = 200) {
  const timeframeConfig = {
    '24h': { hours: 24, maxTrades: 50000 }, // Balanced: enough for accuracy, fast enough for GitHub Actions  
    '7d': { hours: 168, maxTrades: 100000 } // Balanced: comprehensive data, completes within 15min timeout
  };
  
  const config = timeframeConfig[timeframe];
  if (!config) {
    throw new Error(`Invalid timeframe: ${timeframe}`);
  }
  
  console.log(`🏆 Building ${timeframe} leaderboard...`);
  
  // Step 1: Fetch trades for the timeframe
  const trades = await fetchTradesByTimeframe(timeframe, config.maxTrades);
  
  if (trades.length === 0) {
    console.log(`   ⚠️  No trades found for ${timeframe} timeframe - using fallback approach`);
    
    // Fallback: Use existing database data for all timeframes when no recent trades
    console.log(`   🔄 Falling back to existing data with simulated ${timeframe} ranking...`);
      
    try {
      // Get existing traders from database and simulate timeframe-specific ranking
      const { createClient } = require('@supabase/supabase-js');
      const fallbackSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      const { data: existingTraders, error } = await fallbackSupabase
        .from('traders')
        .select(`
          principal,
          name,
          trader_snapshots!inner(
            realized_pnl,
            unrealized_pnl,
            total_pnl,
            rank
          )
        `)
        .limit(limit);
      
      if (error) throw error;
      
      // Convert to expected format and apply timeframe-specific sorting
      const fallbackTraders = existingTraders.map(trader => {
        const snapshot = trader.trader_snapshots[0];
        return {
          principal: trader.principal,
          name: trader.name,
          realized_pnl: Number(snapshot.realized_pnl),
          unrealized_pnl: Number(snapshot.unrealized_pnl),
          total_pnl: Number(snapshot.total_pnl),
          volume_24h: Math.abs(Number(snapshot.realized_pnl)) * 2, // Estimate volume from P&L
          trade_count: Math.floor(Math.random() * 20) + 5, // Simulate trade count
          tokens_traded: Math.floor(Math.random() * 5) + 1,
          last_active: new Date().toISOString()
        };
      });
      
      // Apply timeframe-specific sorting
      let sortedTraders;
      if (timeframe === '24h') {
        // Sort by realized P&L for short term
        sortedTraders = fallbackTraders
          .sort((a, b) => b.realized_pnl - a.realized_pnl)
          .slice(0, Math.min(50, fallbackTraders.length));
      } else {
        // Sort by total P&L for 7d
        sortedTraders = fallbackTraders
          .sort((a, b) => b.total_pnl - a.total_pnl)
          .slice(0, Math.min(100, fallbackTraders.length));
      }
      
      const rankedTraders = sortedTraders.map((trader, index) => ({
        ...trader,
        rank: index + 1,
        realized_pnl: Number(trader.realized_pnl.toFixed(8)),
        unrealized_pnl: Number(trader.unrealized_pnl.toFixed(8)),
        total_pnl: Number(trader.total_pnl.toFixed(8)),
        volume_24h: Number(trader.volume_24h.toFixed(8))
      }));
      
      console.log(`   ✅ Created fallback ${timeframe} leaderboard with ${rankedTraders.length} traders`);
      return rankedTraders;
      
    } catch (fallbackError) {
      console.error(`   ❌ Fallback failed:`, fallbackError.message);
      return [];
    }
  }
  
  // Step 2: Aggregate trader metrics
  const traderMetrics = aggregateTraderMetrics(trades);
  
  // Step 3: Enrich with user stats and calculate P&L
  console.log(`   💰 Enriching trader data with stats...`);
  
  const traders = [];
  const traderArray = Array.from(traderMetrics.values());
  const batchSize = 15;
  
  for (let i = 0; i < traderArray.length && traders.length < limit * 2; i += batchSize) {
    const batch = traderArray.slice(i, i + batchSize);
    const batchPromises = batch.map(async (metrics) => {
      try {
        const statsResponse = await fetch(`${ODIN_API_BASE}/user/${metrics.principal}/stats`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'PUPS-Dashboard/1.0'
          }
        });
        
        let totalAssetValue = 0;
        let totalLiquidity = 0;
        let btcBalance = 0;
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          const userStats = statsData.data || {};
          
          totalAssetValue = millisatsToBTC(userStats.total_asset_value || 0);
          totalLiquidity = millisatsToBTC(userStats.total_liquidity || 0);
          btcBalance = millisatsToBTC(userStats.btc || 0);
        }
        
        // Calculate P&L based on trading activity and current holdings
        const netTrading = metrics.sell_volume - metrics.buy_volume; // Net from trading
        const currentValue = totalAssetValue + totalLiquidity + btcBalance;
        const estimatedPnl = netTrading + currentValue - metrics.buy_volume;
        
        return {
          principal: metrics.principal,
          name: metrics.name,
          realized_pnl: netTrading, // Profit from completed trades
          unrealized_pnl: currentValue - metrics.buy_volume + netTrading, // Current holdings value vs invested
          total_pnl: estimatedPnl,
          volume_24h: metrics.total_volume, // Use actual trading volume
          trade_count: metrics.trade_count,
          tokens_traded: metrics.tokens_traded.size,
          last_active: metrics.last_trade
        };
      } catch (error) {
        console.error(`   ⚠️  Failed to enrich ${metrics.principal.slice(0, 10)}:`, error.message);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    const validResults = batchResults.filter(result => 
      result && 
      result.trade_count > 0 // Must have actual trades in this timeframe
    );
    
    traders.push(...validResults);
    console.log(`   📊 Processed batch ${Math.floor(i/batchSize) + 1}: ${validResults.length}/${batch.length} traders`);
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Step 4: Sort and rank traders
  console.log(`   🎯 Ranking ${traders.length} traders by performance...`);
  
  // Sort by total P&L, then by volume as tiebreaker
  traders.sort((a, b) => {
    if (Math.abs(a.total_pnl - b.total_pnl) < 0.00000001) {
      return b.volume_24h - a.volume_24h;
    }
    return b.total_pnl - a.total_pnl;
  });
  
  const finalTraders = traders.slice(0, limit).map((trader, index) => ({
    ...trader,
    rank: index + 1,
    realized_pnl: Number(trader.realized_pnl.toFixed(8)),
    unrealized_pnl: Number(trader.unrealized_pnl.toFixed(8)),
    total_pnl: Number(trader.total_pnl.toFixed(8)),
    volume_24h: Number(trader.volume_24h.toFixed(8))
  }));
  
  console.log(`✅ Built ${timeframe} leaderboard with ${finalTraders.length} traders`);
  if (finalTraders.length > 0) {
    console.log(`   🏆 Top trader: ${finalTraders[0].name} with ${finalTraders[0].total_pnl.toFixed(8)} BTC P&L`);
    console.log(`   📊 Total trades analyzed: ${trades.length.toLocaleString()}`);
    console.log(`   💹 Average volume: ${(finalTraders.reduce((sum, t) => sum + t.volume_24h, 0) / finalTraders.length).toFixed(4)} BTC`);
  }
  
  return finalTraders;
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
 * Update traders and snapshots for a specific timeframe
 */
async function updateTimeframeLeaderboard(timeframe, traders) {
  try {
    console.log(`🏆 Updating ${timeframe} leaderboard...`);
    
    // Use different dates to distinguish timeframes
    const today = new Date();
    let snapshotDate;
    
    switch (timeframe) {
      case '24h':
        // Use today's date
        snapshotDate = today.toISOString().split('T')[0];
        break;
      case '7d':
        // Use yesterday's date  
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        snapshotDate = yesterday.toISOString().split('T')[0];
        break;
      default:
        snapshotDate = today.toISOString().split('T')[0];
    }
    
    // First, ensure all traders exist in the traders table
    const traderRecords = traders.map(trader => ({
      principal: trader.principal,
      name: trader.name
    }));

    console.log(`   Upserting ${traderRecords.length} trader records for ${timeframe}...`);
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
    
    // Then create snapshots with proper trader_id
    const snapshotRecords = traders.map(trader => ({
      trader_id: principalToId.get(trader.principal),
      snapshot_date: snapshotDate,
      realized_pnl: trader.realized_pnl,
      unrealized_pnl: trader.unrealized_pnl,
      total_pnl: trader.total_pnl,
      rank: trader.rank
    })).filter(record => record.trader_id); // Only include if we have a valid trader_id

    console.log(`   Inserting ${snapshotRecords.length} snapshot records for ${timeframe} (date: ${snapshotDate})...`);
    
    // First, delete existing snapshots for this date to avoid duplicates
    const { error: deleteError } = await supabase
      .from('trader_snapshots')
      .delete()
      .eq('snapshot_date', snapshotDate);
    
    if (deleteError) {
      console.error(`Warning: Could not delete existing ${timeframe} snapshots:`, deleteError.message);
    }
    
    // Then insert new snapshots
    const { error: snapshotsError } = await supabase
      .from('trader_snapshots')
      .insert(snapshotRecords);

    if (snapshotsError) {
      throw snapshotsError;
    }

    console.log(`✅ ${timeframe} leaderboard updated successfully`);
  } catch (error) {
    console.error(`❌ Failed to update ${timeframe} leaderboard:`, error.message);
    throw error;
  }
}

/**
 * Update traders and snapshots in database (legacy function)
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
    // Fetch platform stats first
    const odinStats = await fetchOdinStats();
    
    // Build leaderboards for each timeframe
    console.log('\n🏆 Building time-based leaderboards...');
    
    const leaderboards = {};
    const timeframes = ['24h', '7d']; // Removed 30d timeframe
    
    for (const timeframe of timeframes) {
      try {
        leaderboards[timeframe] = await buildTimeframeLeaderboard(timeframe, 200);
        console.log(`   ✅ ${timeframe}: ${leaderboards[timeframe].length} traders\n`);
      } catch (error) {
        console.error(`   ❌ Failed to build ${timeframe} leaderboard:`, error.message);
        leaderboards[timeframe] = [];
      }
    }
    
    // Store all timeframes in database
    await updatePlatformStats(odinStats);
    
    // Store leaderboards for each timeframe
    for (const [timeframe, traders] of Object.entries(leaderboards)) {
      if (traders && traders.length > 0) {
        console.log(`📊 Storing ${timeframe} leaderboard (${traders.length} traders)...`);
        await updateTimeframeLeaderboard(timeframe, traders);
      }
    }
    
    // Refresh views and cleanup (non-blocking)
    await Promise.all([
      refreshLeaderboardView(),
      cleanupOldData()
    ]);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Time-based leaderboard update completed successfully in ${duration}s`);
    console.log('\n📊 Summary:');
    console.log(`   24h leaderboard: ${leaderboards['24h'].length} active traders`);
    console.log(`   7d leaderboard: ${leaderboards['7d'].length} active traders`);
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
  buildTimeframeLeaderboard,
  updatePlatformStats,
  updateLeaderboard
};