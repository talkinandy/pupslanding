#!/usr/bin/env node

/**
 * Test the correct trades sorting syntax found in documentation
 */

const ODIN_API_BASE = 'https://api.odin.fun/v1';

function millisatsToBTC(millisats) {
  return parseInt(millisats) / 100_000_000_000;
}

async function testCorrectTradesSorting() {
  console.log('🎯 Testing Correct Trades Sorting Syntax');
  console.log('======================================\n');
  
  try {
    // Test the correct syntax from documentation
    console.log('🔍 Testing: sort=time:desc (URL encoded as time%3Adesc)');
    
    const response = await fetch(`${ODIN_API_BASE}/trades?limit=100&sort=time%3Adesc`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PUPS-Dashboard/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const trades = data.data || [];
    
    console.log(`✅ SUCCESS: Got ${trades.length} trades with correct sorting!`);
    
    if (trades.length > 0) {
      console.log('\n📅 First 10 trades (should be most recent first):');
      trades.slice(0, 10).forEach((trade, i) => {
        const amount = millisatsToBTC(parseInt(trade.amount_btc || 0));
        const username = trade.user_username || trade.user?.slice(0, 10) || 'Unknown';
        console.log(`   ${i + 1}. ${trade.time} - ${username} - ${amount.toFixed(6)} BTC - ${trade.token}`);
      });
      
      // Check if we have recent trades (last 24 hours)
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      console.log(`\n🔍 Checking for trades in last 24 hours (after ${oneDayAgo.toISOString()}):`);
      
      const recentTrades = trades.filter(trade => new Date(trade.time) >= oneDayAgo);
      console.log(`   Found ${recentTrades.length} trades in last 24 hours`);
      
      if (recentTrades.length > 0) {
        console.log('   🎉 RECENT TRADES FOUND!');
        
        const uniqueTraders = new Set(recentTrades.map(t => t.user));
        const totalVolume = recentTrades.reduce((sum, trade) => {
          return sum + millisatsToBTC(parseInt(trade.amount_btc || 0));
        }, 0);
        
        console.log(`   👥 Unique traders in 24h: ${uniqueTraders.size}`);
        console.log(`   💰 Total volume in 24h: ${totalVolume.toFixed(8)} BTC`);
        
        // Show most recent trades
        console.log('\n   🔥 Most recent 5 trades:');
        recentTrades.slice(0, 5).forEach((trade, i) => {
          const amount = millisatsToBTC(parseInt(trade.amount_btc || 0));
          const username = trade.user_username || trade.user?.slice(0, 10);
          const minutesAgo = Math.floor((now - new Date(trade.time)) / (1000 * 60));
          console.log(`      ${i + 1}. ${username} - ${amount.toFixed(6)} BTC - ${minutesAgo}min ago`);
        });
        
      } else {
        console.log('   ⚠️  No trades found in last 24 hours');
        
        // Show when the most recent trade was
        const mostRecentTrade = trades[0];
        const hoursAgo = Math.floor((now - new Date(mostRecentTrade.time)) / (1000 * 60 * 60));
        console.log(`   📅 Most recent trade was ${hoursAgo} hours ago (${mostRecentTrade.time})`);
      }
      
      // Test pagination to get more recent data
      console.log('\n🔍 Testing pagination for more recent trades...');
      
      for (let page = 1; page <= 3; page++) {
        const paginatedResponse = await fetch(
          `${ODIN_API_BASE}/trades?limit=100&sort=time%3Adesc&page=${page}`, 
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'PUPS-Dashboard/1.0'
            }
          }
        );
        
        if (paginatedResponse.ok) {
          const paginatedData = await paginatedResponse.json();
          const paginatedTrades = paginatedData.data || [];
          
          if (paginatedTrades.length > 0) {
            const recentInPage = paginatedTrades.filter(trade => new Date(trade.time) >= oneDayAgo);
            console.log(`   Page ${page}: ${paginatedTrades.length} trades, ${recentInPage.length} recent`);
            
            if (paginatedTrades.length > 0) {
              console.log(`      Latest: ${paginatedTrades[0].time}`);
              console.log(`      Oldest: ${paginatedTrades[paginatedTrades.length - 1].time}`);
            }
          } else {
            console.log(`   Page ${page}: No data`);
            break;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function compareWithStatistics() {
  console.log('\n📊 Comparing with Statistics Dashboard Data');
  console.log('==========================================\n');
  
  try {
    const statsResponse = await fetch(`${ODIN_API_BASE}/statistics/dashboard`);
    const stats = await statsResponse.json();
    
    const todayActivity = stats.activities_30d?.[0];
    if (todayActivity) {
      const buyTrades = todayActivity.activity_types.buy?.count || 0;
      const sellTrades = todayActivity.activity_types.sell?.count || 0;
      const totalStatsTrades = buyTrades + sellTrades;
      
      const buyVolume = millisatsToBTC(parseInt(todayActivity.activity_types.buy?.amount_btc || 0));
      const sellVolume = millisatsToBTC(parseInt(todayActivity.activity_types.sell?.amount_btc || 0));
      const totalStatsVolume = buyVolume + sellVolume;
      
      console.log('📈 Statistics Dashboard (Today\'s Activity):');
      console.log(`   Total trades: ${totalStatsTrades.toLocaleString()}`);
      console.log(`   Total volume: ${totalStatsVolume.toFixed(8)} BTC`);
      console.log(`   Buy trades: ${buyTrades}, Sell trades: ${sellTrades}`);
    }
    
    console.log('\n🤔 COMPARISON CONCLUSION:');
    console.log('========================');
    console.log('• If /trades with correct sorting shows recent data → Use trades endpoint');
    console.log('• If /trades still shows old data → Use statistics/dashboard');
    console.log('• Statistics gives aggregated counts, trades gives individual transactions');
    console.log('• For leaderboard, we need individual trader data from trades endpoint');
    
  } catch (error) {
    console.error('❌ Statistics comparison failed:', error.message);
  }
}

async function main() {
  await testCorrectTradesSorting();
  await compareWithStatistics();
}

if (require.main === module) {
  main();
}