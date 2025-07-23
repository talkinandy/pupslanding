#!/usr/bin/env node

/**
 * Test script to fetch actual 24h trades and count unique traders
 */

const ODIN_API_BASE = 'https://api.odin.fun/v1';

/**
 * Convert millisatoshis to BTC
 */
function millisatsToBTC(millisats) {
  return parseInt(millisats) / 100_000_000_000;
}

/**
 * Fetch trades from the last 24 hours
 */
async function fetch24hTrades() {
  console.log('🔍 Fetching trades from the last 24 hours...');
  
  // Calculate 24h cutoff time
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
  console.log(`   🕒 Looking for trades after: ${cutoffTime.toISOString()}`);
  
  const allTrades = [];
  const uniqueTraders = new Set();
  const batchSize = 1000;
  let offset = 0;
  let consecutiveEmptyBatches = 0;
  const maxConsecutiveEmpty = 10; // Check more batches for 24h test
  
  while (consecutiveEmptyBatches < maxConsecutiveEmpty) {
    console.log(`   📈 Fetching batch ${Math.floor(offset/batchSize) + 1} (offset: ${offset})...`);
    
    const response = await fetch(`${ODIN_API_BASE}/trades?limit=${batchSize}&offset=${offset}`, {
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
    
    // Show sample of trade times for first batch
    if (offset === 0) {
      console.log(`   🔍 Sample trade times from batch 1:`);
      console.log(`      Latest: ${trades[0].time}`);
      console.log(`      Oldest: ${trades[trades.length-1].time}`);
    }
    
    // Filter trades within 24h timeframe
    let recentTradeCount = 0;
    let oldTradeCount = 0;
    
    for (const trade of trades) {
      const tradeTime = new Date(trade.time);
      if (tradeTime >= cutoffTime) {
        allTrades.push(trade);
        uniqueTraders.add(trade.user);
        recentTradeCount++;
      } else {
        oldTradeCount++;
      }
    }
    
    console.log(`   📊 Batch ${Math.floor(offset/batchSize) + 1}: ${recentTradeCount} recent, ${oldTradeCount} old`);
    console.log(`      Total recent trades: ${allTrades.length}, Unique traders: ${uniqueTraders.size}`);
    
    // Track consecutive empty batches
    if (recentTradeCount === 0) {
      consecutiveEmptyBatches++;
    } else {
      consecutiveEmptyBatches = 0;
    }
    
    // If all trades in this batch are old, we're probably past our timeframe
    if (oldTradeCount === trades.length && allTrades.length > 0) {
      console.log(`   🎯 All trades in batch are older than 24h, stopping search`);
      break;
    }
    
    offset += batchSize;
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  if (consecutiveEmptyBatches >= maxConsecutiveEmpty) {
    console.log(`   ⏹️  Stopped after ${maxConsecutiveEmpty} consecutive batches with no recent trades`);
  }
  
  console.log('\n📊 24-Hour Trade Analysis Results:');
  console.log(`   🔢 Total trades in last 24h: ${allTrades.length.toLocaleString()}`);
  console.log(`   👥 Unique traders in last 24h: ${uniqueTraders.size.toLocaleString()}`);
  
  if (allTrades.length > 0) {
    // Calculate total volume
    const totalVolume = allTrades.reduce((sum, trade) => sum + millisatsToBTC(trade.amount_btc), 0);
    console.log(`   💰 Total volume: ${totalVolume.toFixed(8)} BTC`);
    
    // Show trade time range
    const tradeTimes = allTrades.map(t => new Date(t.time)).sort((a, b) => a - b);
    console.log(`   ⏰ Time range: ${tradeTimes[0].toISOString()} to ${tradeTimes[tradeTimes.length-1].toISOString()}`);
    
    // Show top traders by trade count
    const traderCounts = {};
    allTrades.forEach(trade => {
      traderCounts[trade.user] = (traderCounts[trade.user] || 0) + 1;
    });
    
    const topTraders = Object.entries(traderCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    console.log('\n   🏆 Top 10 Most Active Traders (by trade count):');
    topTraders.forEach(([trader, count], index) => {
      const username = allTrades.find(t => t.user === trader)?.user_username || trader.slice(0, 10);
      console.log(`      ${index + 1}. ${username}: ${count} trades`);
    });
    
  } else {
    console.log('   ⚠️  No trades found in the last 24 hours');
    
    // Show when the most recent trades occurred
    console.log('\n   🔍 Checking when the most recent trades occurred...');
    const response = await fetch(`${ODIN_API_BASE}/trades?limit=5`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PUPS-Dashboard/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const recentTrades = data.data || [];
      
      if (recentTrades.length > 0) {
        console.log('   📈 Most recent trades:');
        recentTrades.forEach((trade, index) => {
          const hoursAgo = Math.floor((Date.now() - new Date(trade.time)) / (1000 * 60 * 60));
          console.log(`      ${index + 1}. ${trade.time} (${hoursAgo} hours ago)`);
        });
      }
    }
  }
  
  return {
    totalTrades: allTrades.length,
    uniqueTraders: uniqueTraders.size,
    trades: allTrades,
    traderList: Array.from(uniqueTraders)
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting 24-hour trade analysis...');
    console.log(`   Current time: ${new Date().toISOString()}\n`);
    
    const result = await fetch24hTrades();
    
    console.log('\n✅ Analysis complete!');
    console.log(`📊 Summary: ${result.totalTrades} trades from ${result.uniqueTraders} unique traders in the last 24 hours`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { fetch24hTrades, main };