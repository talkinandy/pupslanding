#!/usr/bin/env node

/**
 * Debug script to understand the volume vs trades discrepancy
 */

const ODIN_API_BASE = 'https://api.odin.fun/v1';

async function debugVolumeDiscrepancy() {
  console.log('🔍 Debugging Volume vs Trades Discrepancy');
  console.log('==========================================\n');
  
  try {
    // 1. Get detailed platform statistics
    console.log('📊 Fetching detailed platform statistics...');
    const statsResponse = await fetch(`${ODIN_API_BASE}/statistics/dashboard`);
    const stats = await statsResponse.json();
    
    console.log('Raw API Response:', JSON.stringify(stats, null, 2));
    
    // 2. Calculate volume from known trades
    console.log('\n📈 Calculating volume from known trades...');
    const tradesResponse = await fetch(`${ODIN_API_BASE}/trades?limit=1000`);
    const tradesData = await tradesResponse.json();
    const trades = tradesData.data || [];
    
    let calculatedVolume = 0;
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    trades.forEach(trade => {
      const tradeTime = new Date(trade.time);
      if (tradeTime >= oneDayAgo) {
        calculatedVolume += parseInt(trade.amount_btc || 0);
      }
    });
    
    const calculatedVolumeBTC = calculatedVolume / 100_000_000_000;
    console.log(`Calculated 24h volume from trades: ${calculatedVolumeBTC.toFixed(8)} BTC`);
    console.log(`API reported 24h volume: ${(parseInt(stats.total_volume_24h) / 100_000_000_000).toFixed(8)} BTC`);
    console.log(`Discrepancy: ${((parseInt(stats.total_volume_24h) / 100_000_000_000) - calculatedVolumeBTC).toFixed(8)} BTC`);
    
    // 3. Check if there are other endpoints
    console.log('\n🔍 Testing alternative API endpoints...');
    
    const alternativeEndpoints = [
      '/trades/live',
      '/trades/current',
      '/trades/today',
      '/live-trades',
      '/current-trades',
      '/market/trades',
      '/api/trades',
      '/v1/market/trades',
      '/v2/trades',
      '/trading/recent',
      '/feed/trades'
    ];
    
    for (const endpoint of alternativeEndpoints) {
      try {
        const response = await fetch(`${ODIN_API_BASE}${endpoint}?limit=5`);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Found endpoint: ${endpoint}`);
          console.log(`   Data sample:`, JSON.stringify(data, null, 2).slice(0, 200));
        } else if (response.status !== 404) {
          console.log(`⚠️  ${endpoint}: HTTP ${response.status}`);
        }
      } catch (error) {
        // Ignore connection errors for alternative endpoints
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 4. Check if the base URL or API version is different
    console.log('\n🌐 Testing alternative API base URLs...');
    
    const alternativeBaseUrls = [
      'https://api.odin.fun/v2',
      'https://api.odin.fun/live',
      'https://odin.fun/api/v1',
      'https://backend.odin.fun/v1',
      'https://api-v2.odin.fun/v1'
    ];
    
    for (const baseUrl of alternativeBaseUrls) {
      try {
        const response = await fetch(`${baseUrl}/trades?limit=5`);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Found alternative API: ${baseUrl}`);
          if (data.data && data.data.length > 0) {
            console.log(`   Latest trade: ${data.data[0].time}`);
          }
        }
      } catch (error) {
        // Ignore errors for alternative URLs
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // 5. Check if trades are stored in a different format/endpoint
    console.log('\n📊 Checking statistics breakdown...');
    
    // Try to get more detailed statistics
    const detailedEndpoints = [
      '/statistics/detailed',
      '/statistics/trades',
      '/statistics/volume',
      '/statistics/daily',
      '/stats/dashboard',
      '/metrics/daily'
    ];
    
    for (const endpoint of detailedEndpoints) {
      try {
        const response = await fetch(`${ODIN_API_BASE}${endpoint}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Found statistics endpoint: ${endpoint}`);
          console.log(`   Data:`, JSON.stringify(data, null, 2));
        }
      } catch (error) {
        // Ignore errors
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 6. Time zone analysis
    console.log('\n🕐 Time zone analysis...');
    console.log(`Current UTC time: ${new Date().toISOString()}`);
    console.log(`24h ago UTC: ${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`);
    
    // Try different time zone interpretations
    const timezones = [-12, -8, -5, 0, 1, 8]; // Various timezone offsets
    timezones.forEach(offset => {
      const adjustedTime = new Date(Date.now() + offset * 60 * 60 * 1000);
      const adjustedCutoff = new Date(adjustedTime.getTime() - 24 * 60 * 60 * 1000);
      console.log(`UTC${offset >= 0 ? '+' : ''}${offset}: now=${adjustedTime.toISOString()}, 24h ago=${adjustedCutoff.toISOString()}`);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugVolumeDiscrepancy();