#!/usr/bin/env node

/**
 * Test mobile UI design for dashboard using Puppeteer
 */

const puppeteer = require('puppeteer');

async function testMobileUI() {
  console.log('📱 Testing mobile UI design...');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
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
    await page.waitForSelector('[data-testid="dashboard-page"], .container', { timeout: 10000 });
    
    console.log('📸 Taking mobile screenshots...');
    
    // Screenshot 1: Hero section
    await page.screenshot({
      path: 'mobile-hero.png',
      clip: { x: 0, y: 0, width: 390, height: 844 }
    });
    
    // Scroll to leaderboard table
    await page.evaluate(() => {
      const table = document.querySelector('.bg-white\\/5');
      if (table) table.scrollIntoView({ behavior: 'smooth' });
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Screenshot 2: Leaderboard table
    await page.screenshot({
      path: 'mobile-table.png',
      clip: { x: 0, y: 0, width: 390, height: 844 }
    });
    
    // Check specific mobile issues
    console.log('\n🔍 Analyzing mobile UI issues...');
    
    const issues = await page.evaluate(() => {
      const problems = [];
      
      // Check table responsiveness
      const table = document.querySelector('.bg-white\\/5');
      if (table) {
        const tableWidth = table.getBoundingClientRect().width;
        const viewportWidth = window.innerWidth;
        if (tableWidth > viewportWidth) {
          problems.push(`Table overflow: ${tableWidth}px > ${viewportWidth}px`);
        }
      }
      
      // Check button sizes on mobile
      const buttons = document.querySelectorAll('button');
      buttons.forEach((btn, i) => {
        const rect = btn.getBoundingClientRect();
        if (rect.height < 44) { // iOS minimum touch target
          problems.push(`Button ${i+1} too small: ${rect.height}px height`);
        }
      });
      
      // Check text readability
      const smallTexts = document.querySelectorAll('.text-sm, .text-xs');
      smallTexts.forEach((text, i) => {
        const styles = window.getComputedStyle(text);
        const fontSize = parseFloat(styles.fontSize);
        if (fontSize < 14) {
          problems.push(`Text ${i+1} too small: ${fontSize}px`);
        }
      });
      
      // Check horizontal scrolling
      const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
      if (hasHorizontalScroll) {
        problems.push(`Horizontal scroll detected: ${document.body.scrollWidth}px > ${window.innerWidth}px`);
      }
      
      return problems;
    });
    
    console.log('📊 Mobile UI Issues Found:');
    if (issues.length === 0) {
      console.log('   ✅ No major issues detected');
    } else {
      issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ❌ ${issue}`);
      });
    }
    
    // Test scrolling and interactions
    console.log('\n🖱️  Testing mobile interactions...');
    
    // Try to tap filter buttons
    try {
      await page.tap('button:has-text("24H")');
      console.log('   ✅ 24H filter tap works');
    } catch (error) {
      console.log('   ❌ 24H filter tap failed:', error.message);
    }
    
    // Try to tap a trader row
    try {
      await page.tap('.grid.grid-cols-4:first-of-type');
      console.log('   ✅ Trader row tap works');
    } catch (error) {
      console.log('   ❌ Trader row tap failed:', error.message);
    }
    
    console.log('\n📱 Mobile UI test completed');
    console.log('Screenshots saved: mobile-hero.png, mobile-table.png');
    
    // Keep browser open for manual inspection
    console.log('\n👀 Browser kept open for manual inspection...');
    console.log('Press Ctrl+C to close');
    
    // Wait indefinitely
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Mobile UI test failed:', error.message);
  } finally {
    await browser.close();
  }
}

async function main() {
  try {
    await testMobileUI();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}