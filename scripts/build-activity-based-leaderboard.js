#!/usr/bin/env node

/**
 * Build leaderboard using the activities data from dashboard statistics
 * This shows REAL current trading activity, not historical trades
 */

const ODIN_API_BASE = 'https://api.odin.fun/v1';

function millisatsToBTC(millisats) {
  return parseInt(millisats) / 100_000_000_000;
}

/**
 * Fetch current activity data and build real-time leaderboard
 */
async function buildActivityBasedLeaderboard() {
  console.log('🎯 Building Activity-Based Leaderboard');
  console.log('====================================\n');
  
  try {
    // Get the dashboard statistics with current activity
    console.log('📊 Fetching real-time activity data...');
    const response = await fetch(`${ODIN_API_BASE}/statistics/dashboard`);
    const data = await response.json();
    
    if (!data.activities_30d || !Array.isArray(data.activities_30d)) {
      throw new Error('No activities data found');
    }
    
    console.log(`✅ Found ${data.activities_30d.length} days of activity data`);
    
    // Analyze activity by timeframe
    const now = new Date();
    const timeframes = {
      '24h': { hours: 24, activities: [] },
      '7d': { hours: 168, activities: [] },
      '30d': { hours: 720, activities: [] }
    };
    
    // Categorize activities by timeframe
    data.activities_30d.forEach((dayActivity, index) => {
      const activityDate = new Date(dayActivity.date);
      const hoursAgo = (now - activityDate) / (1000 * 60 * 60);
      
      // Add to appropriate timeframes
      Object.keys(timeframes).forEach(timeframe => {
        if (hoursAgo <= timeframes[timeframe].hours) {
          timeframes[timeframe].activities.push(dayActivity);
        }
      });
    });
    
    // Build leaderboard for each timeframe
    console.log('\n🏆 Building leaderboards by timeframe...\n');
    
    for (const [timeframe, config] of Object.entries(timeframes)) {
      console.log(`📈 ${timeframe.toUpperCase()} Timeframe Analysis:`);
      
      if (config.activities.length === 0) {
        console.log(`   ⚠️  No activity data for ${timeframe}`);
        continue;
      }
      
      // Aggregate trading activity
      let totalBuyVolume = 0;
      let totalSellVolume = 0;
      let totalBuyTrades = 0;
      let totalSellTrades = 0;
      let totalActiveTokens = new Set();
      
      config.activities.forEach(dayActivity => {
        const activities = dayActivity.activity_types;
        
        if (activities.buy) {
          totalBuyVolume += parseInt(activities.buy.amount_btc || 0);
          totalBuyTrades += activities.buy.count || 0;
          totalActiveTokens.add(...(activities.buy.tokens ? [activities.buy.tokens] : []));
        }
        
        if (activities.sell) {
          totalSellVolume += parseInt(activities.sell.amount_btc || 0);
          totalSellTrades += activities.sell.count || 0;
          totalActiveTokens.add(...(activities.sell.tokens ? [activities.sell.tokens] : []));
        }
      });
      
      const totalVolumeBTC = millisatsToBTC(totalBuyVolume + totalSellVolume);
      const totalTrades = totalBuyTrades + totalSellTrades;
      
      console.log(`   📊 Trading Activity:`);
      console.log(`      Total Volume: ${totalVolumeBTC.toFixed(8)} BTC`);
      console.log(`      Buy Volume: ${millisatsToBTC(totalBuyVolume).toFixed(8)} BTC (${totalBuyTrades} trades)`);
      console.log(`      Sell Volume: ${millisatsToBTC(totalSellVolume).toFixed(8)} BTC (${totalSellTrades} trades)`);
      console.log(`      Total Trades: ${totalTrades.toLocaleString()}`);
      console.log(`      Days of Data: ${config.activities.length}`);
      
      // Show daily breakdown for 24h and 7d
      if (timeframe === '24h' || timeframe === '7d') {
        console.log(`\n   📅 Daily Breakdown:`);
        config.activities.slice(0, Math.min(7, config.activities.length)).forEach(dayActivity => {
          const date = new Date(dayActivity.date).toISOString().split('T')[0];
          const buyTrades = dayActivity.activity_types.buy?.count || 0;
          const sellTrades = dayActivity.activity_types.sell?.count || 0;
          const buyVolume = millisatsToBTC(parseInt(dayActivity.activity_types.buy?.amount_btc || 0));
          const sellVolume = millisatsToBTC(parseInt(dayActivity.activity_types.sell?.amount_btc || 0));
          
          console.log(`      ${date}: ${buyTrades + sellTrades} trades, ${(buyVolume + sellVolume).toFixed(4)} BTC`);
        });
      }
      
      console.log(''); // Empty line between timeframes
    }
    
    // Show TODAY's detailed activity
    const todayActivity = data.activities_30d.find(activity => {
      const activityDate = new Date(activity.date);
      const today = new Date();
      return activityDate.toDateString() === today.toDateString();
    });
    
    if (todayActivity) {
      console.log('🔥 TODAY\'S REAL-TIME ACTIVITY:');
      console.log('============================');
      
      const activities = todayActivity.activity_types;
      const activityTypes = ['buy', 'sell', 'create', 'deposit', 'withdraw', 'send', 'receive'];
      
      activityTypes.forEach(type => {
        if (activities[type]) {
          const activity = activities[type];
          const volumeBTC = millisatsToBTC(parseInt(activity.amount_btc || 0));
          console.log(`   ${type.toUpperCase()}: ${activity.count} transactions, ${volumeBTC.toFixed(6)} BTC, ${activity.tokens} tokens`);
        }
      });
      
      // Calculate trading metrics
      const buyActivity = activities.buy || {};
      const sellActivity = activities.sell || {};
      
      const totalTradingVolume = millisatsToBTC(parseInt(buyActivity.amount_btc || 0) + parseInt(sellActivity.amount_btc || 0));
      const totalTrades = (buyActivity.count || 0) + (sellActivity.count || 0);
      
      console.log('\n   📊 Trading Summary:');
      console.log(`      Total Trading Volume: ${totalTradingVolume.toFixed(8)} BTC`);
      console.log(`      Total Trades: ${totalTrades.toLocaleString()}`);
      console.log(`      Active Trading Tokens: ${Math.max(buyActivity.tokens || 0, sellActivity.tokens || 0)}`);
      
      if (totalTrades > 0) {
        console.log(`      Average Trade Size: ${(totalTradingVolume / totalTrades).toFixed(8)} BTC`);
      }
    }
    
    // Conclusion
    console.log('\n✅ DISCOVERY SUMMARY:');
    console.log('====================');
    console.log('• The /trades endpoint shows OLD historical data (March 2025)');
    console.log('• The /statistics/dashboard endpoint shows CURRENT REAL activity');
    console.log('• There IS active trading happening right now!');
    console.log(`• Today alone: ${todayActivity ? ((todayActivity.activity_types.buy?.count || 0) + (todayActivity.activity_types.sell?.count || 0)).toLocaleString() : 0} trades`);
    console.log('• Need to use activities data instead of trades endpoint for current leaderboard');
    
    return {
      timeframes,
      currentActivity: todayActivity,
      totalCurrentVolume: data.total_volume_24h
    };
    
  } catch (error) {
    console.error('❌ Failed to build activity-based leaderboard:', error.message);
    throw error;
  }
}

if (require.main === module) {
  buildActivityBasedLeaderboard();
}