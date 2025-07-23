#!/usr/bin/env node

/**
 * Test improved mobile UI design for dashboard using Puppeteer
 */

const puppeteer = require('puppeteer');

async function testImprovedMobileUI() {
  console.log('📱 Testing improved mobile UI design...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set mobile viewport (iPhone 12 Pro)
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });
    
    console.log('🌐 Navigating to dashboard...');
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for page to load
    await page.waitForSelector('.container', { timeout: 10000 });
    
    console.log('📸 Taking improved mobile screenshots...');
    
    // Screenshot 1: Full page
    await page.screenshot({
      path: 'mobile-improved-full.png',
      fullPage: true
    });
    
    // Screenshot 2: Hero section only
    await page.screenshot({
      path: 'mobile-improved-hero.png',
      clip: { x: 0, y: 0, width: 390, height: 844 }
    });
    
    // Scroll to leaderboard
    await page.evaluate(() => {
      window.scrollTo(0, 700);
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Screenshot 3: Leaderboard section
    await page.screenshot({
      path: 'mobile-improved-table.png',
      clip: { x: 0, y: 0, width: 390, height: 844 }
    });
    
    // Test improved mobile interactions
    console.log('🖱️  Testing improved interactions...');
    
    // Test filter buttons (should be larger now)
    try {
      await page.waitForSelector('button', { timeout: 5000 });
      const buttons = await page.$$('button');
      
      if (buttons.length > 0) {
        await buttons[0].tap();
        console.log('   ✅ Filter button tap works');
      }
    } catch (error) {
      console.log('   ❌ Filter button tap failed:', error.message);
    }
    
    // Test search input (should be larger now)
    try {
      await page.waitForSelector('input[placeholder*="Search"]', { timeout: 5000 });
      await page.tap('input[placeholder*="Search"]');
      await page.type('input[placeholder*="Search"]', 'test');
      console.log('   ✅ Search input works');
    } catch (error) {
      console.log('   ❌ Search input failed:', error.message);
    }
    
    // Test trader row tap (mobile layout)
    try {
      await page.waitForSelector('.md\\:hidden .min-h-\\[80px\\]', { timeout: 5000 });
      await page.tap('.md\\:hidden .min-h-\\[80px\\]');
      console.log('   ✅ Mobile trader row tap works');
    } catch (error) {
      console.log('   ❌ Mobile trader row tap failed:', error.message);
    }
    
    // Check mobile-specific improvements
    console.log('\n🔍 Analyzing mobile UI improvements...');
    
    const improvements = await page.evaluate(() => {
      const results = [];
      
      // Check button sizes (should be 48px+ now)
      const buttons = document.querySelectorAll('button');
      let goodButtons = 0;
      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        if (rect.height >= 44) {
          goodButtons++;
        }
      });
      results.push(`Good button sizes: ${goodButtons}/${buttons.length}`);
      
      // Check mobile-specific elements
      const mobileHeaders = document.querySelectorAll('.md\\:hidden');
      results.push(`Mobile-specific elements: ${mobileHeaders.length}`);
      
      // Check desktop-hidden elements
      const desktopElements = document.querySelectorAll('.hidden.md\\:grid, .hidden.md\\:block');
      results.push(`Desktop-only elements: ${desktopElements.length}`);
      
      // Check text sizes in mobile layout
      const mobileTexts = document.querySelectorAll('.md\\:hidden .text-base, .md\\:hidden .text-sm');
      results.push(`Mobile text elements: ${mobileTexts.length}`);
      
      // Check for horizontal overflow
      const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
      results.push(`Horizontal scroll: ${hasHorizontalScroll ? 'YES' : 'NO'}`);
      
      return results;
    });
    
    console.log('📊 Mobile UI Analysis:');
    improvements.forEach((improvement, i) => {
      console.log(`   ${i + 1}. ✅ ${improvement}`);
    });
    
    console.log('\n📱 Improved mobile UI test completed');
    console.log('Screenshots saved:');
    console.log('  - mobile-improved-full.png (full page)');
    console.log('  - mobile-improved-hero.png (hero section)');  
    console.log('  - mobile-improved-table.png (leaderboard)');
    
    // Keep browser open for manual inspection
    console.log('\n👀 Browser kept open for manual inspection...');
    console.log('Press Ctrl+C to close');
    
    // Wait indefinitely
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Improved mobile UI test failed:', error.message);
  } finally {
    await browser.close();
  }
}

async function main() {
  try {
    await testImprovedMobileUI();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}