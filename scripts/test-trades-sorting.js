#!/usr/bin/env node

/**
 * Test various sorting parameters on the /trades endpoint
 */

const ODIN_API_BASE = 'https://api.odin.fun/v1';

async function testTradesSorting() {
  console.log('🧪 Testing Trades Endpoint Sorting Parameters');
  console.log('===========================================\n');
  
  // Test various sorting parameter combinations
  const sortingTests = [
    // Common sorting patterns
    { params: 'sort=time&order=desc', description: 'Sort by time descending' },
    { params: 'sort=time&order=asc', description: 'Sort by time ascending' },
    { params: 'sort=created_at&order=desc', description: 'Sort by created_at descending' },
    { params: 'sort=timestamp&order=desc', description: 'Sort by timestamp descending' },
    { params: 'orderBy=time&order=desc', description: 'Order by time descending' },
    { params: 'orderBy=created_at&order=desc', description: 'Order by created_at descending' },
    
    // Alternative formats
    { params: 'sort=-time', description: 'Sort by time (minus prefix for desc)' },
    { params: 'sort=+time', description: 'Sort by time (plus prefix for asc)' },
    { params: 'order=time-desc', description: 'Order time-desc format' },
    { params: 'order=time-asc', description: 'Order time-asc format' },
    
    // Query parameter variations
    { params: 'sortBy=time&sortOrder=desc', description: 'SortBy/SortOrder format' },
    { params: 'sort_by=time&sort_order=desc', description: 'Snake case format' },
    { params: 'time_sort=desc', description: 'Time sort specific' },
    { params: 'chronological=desc', description: 'Chronological order' },
    
    // Try with different field names
    { params: 'sort=date&order=desc', description: 'Sort by date' },
    { params: 'sort=updated_at&order=desc', description: 'Sort by updated_at' },
    
    // Pagination with sorting
    { params: 'page=1&limit=5&sort=time&order=desc', description: 'Page 1 with time sort desc' },
    { params: 'offset=0&limit=5&sort=time&order=desc', description: 'Offset 0 with time sort desc' }
  ];
  
  const results = [];
  
  for (const test of sortingTests) {
    try {
      console.log(`🔍 Testing: ${test.description}`);
      console.log(`   URL: ${ODIN_API_BASE}/trades?${test.params}`);
      
      const response = await fetch(`${ODIN_API_BASE}/trades?${test.params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PUPS-Dashboard/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const trades = data.data || data.results || data;
        
        if (Array.isArray(trades) && trades.length > 0) {
          // Analyze the order of results
          const timestamps = trades.slice(0, 5).map(trade => ({
            time: trade.time,
            timestamp: new Date(trade.time),
            user: trade.user?.slice(0, 8)
          }));
          
          console.log(`   ✅ SUCCESS: Got ${trades.length} trades`);
          console.log(`   📅 First 5 timestamps:`);
          timestamps.forEach((t, i) => {
            console.log(`      ${i + 1}. ${t.time} (${t.user})`);
          });
          
          // Check if the order is different from default
          const defaultResponse = await fetch(`${ODIN_API_BASE}/trades?limit=5`);
          if (defaultResponse.ok) {
            const defaultData = await defaultResponse.json();
            const defaultTrades = defaultData.data || [];
            
            const isDifferentOrder = timestamps.length > 0 && defaultTrades.length > 0 && 
                                   timestamps[0].time !== defaultTrades[0].time;
            
            if (isDifferentOrder) {
              console.log(`   🎯 DIFFERENT ORDER DETECTED! This parameter works!`);
              results.push({ ...test, status: 'WORKS', trades: timestamps });
            } else {
              console.log(`   ⚠️  Same order as default`);
              results.push({ ...test, status: 'SAME_ORDER', trades: timestamps });
            }
          }
          
        } else {
          console.log(`   ⚠️  No trades in response`);
          results.push({ ...test, status: 'NO_DATA' });
        }
      } else {
        console.log(`   ❌ HTTP ${response.status}: ${response.statusText}`);
        results.push({ ...test, status: 'ERROR', error: response.status });
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({ ...test, status: 'ERROR', error: error.message });
    }
    
    console.log(''); // Empty line
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary of results
  console.log('📊 SORTING TEST RESULTS SUMMARY');
  console.log('==============================\n');
  
  const workingParams = results.filter(r => r.status === 'WORKS');
  const sameOrderParams = results.filter(r => r.status === 'SAME_ORDER');
  const errorParams = results.filter(r => r.status === 'ERROR');
  
  if (workingParams.length > 0) {
    console.log('✅ WORKING SORTING PARAMETERS:');
    workingParams.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.params} - ${result.description}`);
      if (result.trades && result.trades.length > 0) {
        console.log(`      Latest trade: ${result.trades[0].time}`);
      }
    });
  } else {
    console.log('❌ No working sorting parameters found');
  }
  
  if (sameOrderParams.length > 0) {
    console.log('\n⚠️  Parameters that work but return same order as default:');
    sameOrderParams.slice(0, 5).forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.params}`);
    });
  }
  
  if (errorParams.length > 0) {
    console.log('\n❌ Parameters that caused errors:');
    errorParams.slice(0, 5).forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.params} - ${result.error}`);
    });
  }
  
  // Final recommendation
  console.log('\n🎯 RECOMMENDATION:');
  if (workingParams.length > 0) {
    const bestParam = workingParams[0];
    console.log(`Use: ${ODIN_API_BASE}/trades?${bestParam.params}`);
    console.log(`This should give you trades sorted by most recent first.`);
  } else {
    console.log('No sorting parameters found to work. The API might:');
    console.log('1. Not support sorting on the /trades endpoint');
    console.log('2. Have different parameter names not tested');
    console.log('3. Always return trades in historical order (oldest API design)');
    console.log('\nSuggestion: Use the activities data from /statistics/dashboard instead');
  }
  
  return results;
}

if (require.main === module) {
  testTradesSorting();
}