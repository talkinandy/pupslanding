#!/usr/bin/env node

/**
 * Test script to check 24h trade data volume without limits
 */

const ODIN_API_BASE = 'https://api.odin.fun/v1';

/**
 * Fetch trades from Odin API for 24h timeframe without limits
 */
async function fetchAll24hTrades() {
  console.log('🧪 Testing 24h trade data fetch (NO LIMITS)');
  console.log('============================================');
  
  // Calculate 24h cutoff time
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
  console.log(`🕒 Looking for trades after: ${cutoffTime.toISOString()}`);
  
  const allTrades = [];
  const batchSize = 1000;
  let offset = 0;
  let consecutiveEmptyBatches = 0;
  const maxConsecutiveEmpty = 10; // Allow more empty batches for thorough testing
  
  const startTime = Date.now();
  
  while (consecutiveEmptyBatches < maxConsecutiveEmpty) {
    console.log(`📊 Fetching batch ${Math.floor(offset/batchSize) + 1} (offset: ${offset})...`);
    
    const response = await fetch(`${ODIN_API_BASE}/trades?limit=${batchSize}&offset=${offset}&sort=time%3Adesc`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PUPS-Dashboard/1.0'
      }
    });
    
    if (!response.ok) {
      console.error(`   ⚠️  Failed to fetch at offset ${offset}: ${response.status}`);
      break;
    }
    
    const batchData = await response.json();
    const trades = batchData.data || [];
    
    if (trades.length === 0) {
      console.log(`   📈 No more trades at offset ${offset}`);
      break;
    }
    
    // Show sample trade times
    if (offset === 0 && trades.length > 0) {
      console.log(`   🔍 Sample times: latest=${trades[0].time}, oldest=${trades[trades.length-1].time}`);
    }
    
    // Filter trades within 24h and count them
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
    
    console.log(`   📈 Batch results: ${recentTradeCount} recent, ${oldTradeCount} old (total 24h: ${allTrades.length})`);
    
    // Track consecutive empty batches
    if (recentTradeCount === 0) {
      consecutiveEmptyBatches++;
      console.log(`   ⏰ Empty batch ${consecutiveEmptyBatches}/${maxConsecutiveEmpty}`);
    } else {
      consecutiveEmptyBatches = 0;
    }
    
    // If all trades in batch are old, we're past 24h period
    if (oldTradeCount === trades.length && allTrades.length > 0) {
      console.log(`   🎯 Reached older trades, stopping at ${allTrades.length} trades`);
      break;
    }
    
    offset += batchSize;
    
    // Progress update every 10 batches
    if (offset % 10000 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`   ⏱️  Progress: ${allTrades.length} trades in ${elapsed}s`);
    }
    
    // Safety delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n📊 FINAL RESULTS:');
  console.log('================');
  console.log(`Total 24h trades: ${allTrades.length.toLocaleString()}`);
  console.log(`Fetch time: ${totalTime}s`);
  console.log(`Batches processed: ${Math.ceil(offset / batchSize)}`);
  
  if (allTrades.length > 0) {
    console.log(`Oldest trade: ${allTrades[allTrades.length - 1].time}`);
    console.log(`Latest trade: ${allTrades[0].time}`);
    
    // Count unique traders
    const uniqueTraders = new Set(allTrades.map(t => t.user));
    console.log(`Unique traders: ${uniqueTraders.size.toLocaleString()}`);
    
    // Show data volume comparison
    console.log('\n🔍 COMPARISON:');
    console.log(`Previous limit: 5,000 trades`);
    console.log(`Actual 24h data: ${allTrades.length.toLocaleString()} trades`);
    console.log(`Data missed: ${Math.max(0, allTrades.length - 5000).toLocaleString()} trades (${Math.max(0, (allTrades.length - 5000) / allTrades.length * 100).toFixed(1)}%)`);
  }
  
  return allTrades;
}

async function main() {
  try {
    await fetchAll24hTrades();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}