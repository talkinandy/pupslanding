#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function checkOdinSupply() {
  console.log('🔍 Checking token supply display on odin.fun...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🌐 Navigating to https://odin.fun/token/28d2...');
    await page.goto('https://odin.fun/token/28d2', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Look for supply information
    console.log('📊 Looking for supply information...');
    
    const supplyInfo = await page.evaluate(() => {
      const results = [];
      
      // Look for any text containing "21M" or "supply"
      const allText = document.body.innerText;
      
      // Find lines containing supply info
      const lines = allText.split('\n');
      lines.forEach(line => {
        if (line.includes('21M') || line.toLowerCase().includes('supply')) {
          results.push(line.trim());
        }
      });
      
      // Also look for specific elements that might contain supply
      const possibleSelectors = [
        '[data-testid*="supply"]',
        '[class*="supply"]', 
        '[id*="supply"]',
        'span:contains("21M")',
        'div:contains("Supply")',
        'p:contains("21M")'
      ];
      
      possibleSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el.textContent) {
              results.push(`Element: ${el.textContent.trim()}`);
            }
          });
        } catch (e) {
          // Ignore selector errors
        }
      });
      
      return results;
    });
    
    console.log('\n📋 Supply information found:');
    if (supplyInfo.length > 0) {
      supplyInfo.forEach(info => console.log(`   • ${info}`));
    } else {
      console.log('   ❌ No explicit supply information found');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'odin-token-page.png', fullPage: true });
    console.log('\n📸 Screenshot saved as odin-token-page.png');
    
    // Try to find supply in the page structure
    console.log('\n🔍 Searching page structure...');
    
    const pageContent = await page.content();
    if (pageContent.includes('21M') || pageContent.includes('21,000,000')) {
      console.log('   ✅ Found "21M" or "21,000,000" in page content');
    }
    
    // Check API response
    console.log('\n📡 Checking API data...');
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('https://api.odin.fun/v1/token/28d2');
        const data = await response.json();
        return {
          total_supply: data.total_supply,
          divisibility: data.divisibility,
          calculated: data.total_supply / Math.pow(10, data.divisibility)
        };
      } catch (e) {
        return null;
      }
    });
    
    if (apiResponse) {
      console.log(`   Raw supply: ${apiResponse.total_supply}`);
      console.log(`   Divisibility: ${apiResponse.divisibility}`);
      console.log(`   Calculated: ${apiResponse.calculated.toLocaleString()}`);
    }
    
    console.log('\n⏳ Keeping browser open for manual inspection...');
    console.log('   Check the page for supply information');
    console.log('   Press Ctrl+C when done');
    
    await new Promise(() => {}); // Keep browser open
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkOdinSupply();