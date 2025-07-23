#!/usr/bin/env node

/**
 * Fixed script to properly fetch recent trades using pagination and client-side sorting
 */

const ODIN_API_BASE = 'https://api.odin.fun/v1';

/**
 * Convert millisatoshis to BTC
 */
function millisatsToBTC(millisats) {
  return parseInt(millisats) / 100_000_000_000;
}

/**
 * Fetch trades using pagination with proper client-side sorting
 */
async function fetchRecentTradesFixed() {
  console.log('🔍 Fetching recent trades with improved pagination and sorting...');
  
  const allTrades = [];
  const maxPages = 10; // Fetch first 10 pages to get a good sample
  const pageSize = 100;
  
  // Test both trades and transactions endpoints
  const endpoints = [
    { name: 'trades', url: '/trades' },
    { name: 'transactions', url: '/transactions' }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n📊 Testing ${endpoint.name} endpoint...`);
    
    try {
      // Fetch multiple pages
      for (let page = 1; page <= 3; page++) {
        console.log(`   📄 Fetching page ${page}...`);
        
        const response = await fetch(`${ODIN_API_BASE}${endpoint.url}?page=${page}&limit=${pageSize}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'PUPS-Dashboard/1.0'
          }
        });
        
        if (!response.ok) {
          console.error(`   ❌ Failed to fetch page ${page}: ${response.status}`);
          break;
        }
        
        const data = await response.json();
        const trades = data.data || data.results || data;
        
        if (!Array.isArray(trades) || trades.length === 0) {
          console.log(`   📝 Page ${page}: No data found`);
          break;
        }
        
        console.log(`   📝 Page ${page}: ${trades.length} ${endpoint.name}`);
        
        // Add trades with endpoint info
        const tradesWithSource = trades.map(trade => ({
          ...trade,
          source: endpoint.name,
          timestamp: new Date(trade.time || trade.created_at || trade.timestamp)
        }));
        
        allTrades.push(...tradesWithSource);
        
        // Show sample of timestamps from this page
        if (trades.length > 0) {
          const timestamps = trades.slice(0, 3).map(t => t.time || t.created_at || t.timestamp);
          console.log(`      Sample times: ${timestamps.join(', ')}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
    } catch (error) {
      console.error(`   ❌ Error with ${endpoint.name} endpoint:`, error.message);
    }
  }
  
  if (allTrades.length === 0) {
    console.log('❌ No trades found from any endpoint');
    return { trades: [], recentTrades: [] };
  }
  
  console.log(`\n📊 Total trades fetched: ${allTrades.length}`);
  
  // Sort all trades by timestamp (newest first)
  console.log('🔄 Sorting trades by timestamp...');
  const sortedTrades = allTrades
    .filter(trade => trade.timestamp && !isNaN(trade.timestamp.getTime()))
    .sort((a, b) => b.timestamp - a.timestamp);
  
  console.log(`✅ Sorted ${sortedTrades.length} valid trades`);
  
  // Find truly recent trades (last 24 hours)
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const recentTrades = sortedTrades.filter(trade => trade.timestamp >= oneDayAgo);
  
  // Show analysis
  console.log('\n📈 Trade Timeline Analysis:');
  if (sortedTrades.length > 0) {
    console.log(`   📅 Most recent trade: ${sortedTrades[0].timestamp.toISOString()}`);
    console.log(`   📅 Oldest trade fetched: ${sortedTrades[sortedTrades.length - 1].timestamp.toISOString()}`);
    
    // Show time distribution
    const timeRanges = {
      'Last hour': 0,
      'Last 24 hours': 0,
      'Last 7 days': 0,
      'Last 30 days': 0,
      'Older': 0
    };
    
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    sortedTrades.forEach(trade => {
      if (trade.timestamp >= oneHourAgo) timeRanges['Last hour']++;
      else if (trade.timestamp >= oneDayAgo) timeRanges['Last 24 hours']++;
      else if (trade.timestamp >= sevenDaysAgo) timeRanges['Last 7 days']++;
      else if (trade.timestamp >= thirtyDaysAgo) timeRanges['Last 30 days']++;
      else timeRanges['Older']++;
    });
    
    console.log('\n   📊 Time Distribution:');
    Object.entries(timeRanges).forEach(([range, count]) => {
      console.log(`      ${range}: ${count.toLocaleString()} trades`);
    });
  }
  
  // Show recent trades details
  if (recentTrades.length > 0) {
    console.log(`\n🎉 Found ${recentTrades.length} trades in the last 24 hours!`);
    
    const uniqueTraders = new Set(recentTrades.map(t => t.user || t.trader_id));
    const totalVolume = recentTrades.reduce((sum, trade) => {
      const amount = parseInt(trade.amount_btc || trade.amount || 0);
      return sum + millisatsToBTC(amount);
    }, 0);
    
    console.log(`   👥 Unique traders: ${uniqueTraders.size}`);
    console.log(`   💰 Total volume: ${totalVolume.toFixed(8)} BTC`);
    
    // Show top 10 most recent trades
    console.log('\n   🔥 Most Recent Trades:');
    recentTrades.slice(0, 10).forEach((trade, i) => {
      const username = trade.user_username || trade.user?.slice(0, 10) || 'Unknown';
      const amount = millisatsToBTC(parseInt(trade.amount_btc || trade.amount || 0));
      const minutesAgo = Math.floor((now - trade.timestamp) / (1000 * 60));
      
      console.log(`      ${i + 1}. ${username} - ${amount.toFixed(6)} BTC (${minutesAgo}min ago)`);
    });
    
  } else {
    console.log('\n⚠️  No trades found in the last 24 hours');
    
    // Show when the most recent trades actually occurred
    if (sortedTrades.length > 0) {
      const hoursAgo = Math.floor((now - sortedTrades[0].timestamp) / (1000 * 60 * 60));
      console.log(`   📅 Most recent trade was ${hoursAgo} hours ago`);
    }
  }
  
  return {
    trades: sortedTrades,
    recentTrades: recentTrades,
    totalFetched: allTrades.length
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Fixed Recent Trades Analysis');
    console.log('==============================');
    console.log(`Current time: ${new Date().toISOString()}\n`);
    
    const result = await fetchRecentTradesFixed();
    
    console.log('\n✅ Analysis Complete!');
    console.log(`📊 Summary:`);
    console.log(`   • Total trades analyzed: ${result.totalFetched}`);
    console.log(`   • Valid sorted trades: ${result.trades.length}`);
    console.log(`   • Trades in last 24h: ${result.recentTrades.length}`);
    
    if (result.recentTrades.length > 0) {
      const uniqueTraders = new Set(result.recentTrades.map(t => t.user || t.trader_id));
      console.log(`   • Unique active traders: ${uniqueTraders.size}`);
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fetchRecentTradesFixed };