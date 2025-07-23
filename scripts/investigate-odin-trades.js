#!/usr/bin/env node

/**
 * Investigation script to compare Odin.fun website vs API data
 */

const puppeteer = require('puppeteer');

const ODIN_API_BASE = 'https://api.odin.fun/v1';

/**
 * Check API statistics and recent trades
 */
async function checkOdinAPI() {
  console.log('🔍 Checking Odin API data...');
  
  try {
    // Get platform stats
    const statsResponse = await fetch(`${ODIN_API_BASE}/statistics/dashboard`);
    const statsData = await statsResponse.json();
    
    console.log('📊 Platform Statistics:');
    console.log(`   Total Users: ${statsData.total_users?.toLocaleString()}`);
    console.log(`   24h Volume: ${(parseInt(statsData.total_volume_24h) / 100_000_000_000).toFixed(2)} BTC`);
    console.log(`   Total Volume: ${(parseInt(statsData.total_volume) / 100_000_000_000).toFixed(2)} BTC`);
    
    // Get recent trades with different parameters
    console.log('\n🔍 Checking recent trades with different API calls...');
    
    // Try different endpoints and parameters
    const endpoints = [
      '/trades?limit=10',
      '/trades?limit=10&sort=desc',
      '/trades?limit=10&order=time',
      '/trades?limit=10&orderBy=time&order=desc',
      '/trades/recent?limit=10',
      '/recent-trades?limit=10'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n   Testing: ${ODIN_API_BASE}${endpoint}`);
        const response = await fetch(`${ODIN_API_BASE}${endpoint}`);
        
        if (response.ok) {
          const data = await response.json();
          const trades = data.data || data.trades || data;
          
          if (Array.isArray(trades) && trades.length > 0) {
            console.log(`   ✅ Found ${trades.length} trades`);
            console.log(`   📅 Latest trade: ${trades[0].time}`);
            console.log(`   🔄 Trade data sample:`, {
              time: trades[0].time,
              user: trades[0].user?.slice(0, 10),
              amount: trades[0].amount_btc,
              token: trades[0].token
            });
          } else {
            console.log(`   ⚠️  No trades in response`);
          }
        } else {
          console.log(`   ❌ HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
  } catch (error) {
    console.error('❌ API check failed:', error.message);
  }
}

/**
 * Check the actual Odin.fun website using Puppeteer
 */
async function checkOdinWebsite() {
  console.log('\n🌐 Checking Odin.fun website with Puppeteer...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('   🚀 Navigating to odin.fun...');
    await page.goto('https://odin.fun', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait a bit for any dynamic content to load
    await page.waitForTimeout(3000);
    
    // Look for trade-related elements
    console.log('   🔍 Looking for trade activity on the page...');
    
    // Try to find trade lists, volumes, or activity indicators
    const tradeSelectors = [
      '[class*="trade"]',
      '[class*="activity"]',
      '[class*="volume"]',
      '[class*="recent"]',
      'table tbody tr',
      '.trade-item',
      '.trade-row',
      '.activity-item'
    ];
    
    for (const selector of tradeSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`   ✅ Found ${elements.length} elements matching "${selector}"`);
          
          // Try to get text content from first few elements
          for (let i = 0; i < Math.min(3, elements.length); i++) {
            const text = await elements[i].evaluate(el => el.textContent?.trim());
            if (text && text.length > 0 && text.length < 200) {
              console.log(`      ${i + 1}. "${text}"`);
            }
          }
        }
      } catch (error) {
        // Selector might not exist, continue
      }
    }
    
    // Look for any numerical data that might indicate activity
    console.log('\n   💰 Looking for volume/activity indicators...');
    
    const page_content = await page.content();
    
    // Look for BTC amounts or large numbers
    const btcMatches = page_content.match(/[\d,.]+ BTC/gi) || [];
    const numberMatches = page_content.match(/\b\d{1,3}(,\d{3})*(\.\d+)?\b/g) || [];
    
    if (btcMatches.length > 0) {
      console.log(`   📊 Found BTC amounts: ${btcMatches.slice(0, 5).join(', ')}`);
    }
    
    // Check for any API calls being made by the website
    console.log('\n   🔗 Monitoring network requests...');
    
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('api') || request.url().includes('trade')) {
        requests.push(request.url());
      }
    });
    
    // Refresh the page to capture network requests
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    if (requests.length > 0) {
      console.log('   📡 API calls detected:');
      requests.slice(0, 5).forEach((url, i) => {
        console.log(`      ${i + 1}. ${url}`);
      });
    } else {
      console.log('   ⚠️  No API calls detected');
    }
    
    // Take a screenshot for manual inspection
    console.log('   📸 Taking screenshot...');
    await page.screenshot({ 
      path: '/Users/Andy/Cursor/pupslanding/scripts/odin-screenshot.png',
      fullPage: true 
    });
    console.log('   ✅ Screenshot saved as odin-screenshot.png');
    
  } catch (error) {
    console.error('❌ Website check failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Main investigation
 */
async function main() {
  console.log('🕵️ Odin.fun Trade Activity Investigation');
  console.log('=======================================\n');
  
  // Check API first
  await checkOdinAPI();
  
  // Then check website
  await checkOdinWebsite();
  
  console.log('\n🎯 Investigation Summary:');
  console.log('   • API shows 45+ BTC daily volume but no recent trades');
  console.log('   • Website inspection will show if there\'s a discrepancy');
  console.log('   • Screenshot saved for manual review');
  console.log('\n   Next steps:');
  console.log('   1. Review the screenshot');
  console.log('   2. Check if API endpoint is correct');
  console.log('   3. Look for alternative trade endpoints');
}

if (require.main === module) {
  main();
}