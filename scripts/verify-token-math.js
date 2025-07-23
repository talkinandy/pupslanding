#!/usr/bin/env node

/**
 * Verify token math for 21M supply and millisats pricing
 */

async function verifyTokenMath() {
  console.log('🧮 Verifying token math for 21M supply and millisats pricing...\n');
  
  // Constants
  const TOTAL_SUPPLY_RAW = 2100000000000000000;
  const TARGET_SUPPLY = 21000000; // 21 million
  const CORRECT_DIVISOR = Math.pow(10, 11); // 10^11
  
  console.log('=== TOKEN SUPPLY VERIFICATION ===');
  console.log(`Raw total supply: ${TOTAL_SUPPLY_RAW}`);
  console.log(`Target supply: ${TARGET_SUPPLY.toLocaleString()} (21M)`);
  console.log(`Divisor needed: ${CORRECT_DIVISOR} (10^11)`);
  console.log(`Actual supply: ${(TOTAL_SUPPLY_RAW / CORRECT_DIVISOR).toLocaleString()}`);
  console.log(`Correct? ${TOTAL_SUPPLY_RAW / CORRECT_DIVISOR === TARGET_SUPPLY} ✓`);
  
  // Test with real API data
  console.log('\n=== REAL API DATA TEST ===');
  
  try {
    const response = await fetch('https://api.odin.fun/v1/token/2211', {
      headers: { 'Accept': 'application/json' }
    });
    
    const tokenData = await response.json();
    
    console.log(`Token: ${tokenData.name} (${tokenData.ticker})`);
    console.log(`Total supply (raw): ${tokenData.total_supply}`);
    console.log(`Actual supply: ${(tokenData.total_supply / CORRECT_DIVISOR).toLocaleString()} tokens`);
    console.log(`Price (millisats): ${tokenData.price}`);
    console.log(`Price (BTC): ${(tokenData.price / 100_000_000_000).toFixed(10)} BTC`);
    
    // Example balance calculations
    console.log('\n=== BALANCE EXAMPLES ===');
    
    const testBalances = [
      { raw: 1000000000000, label: 'Small holder' },     // 10 tokens
      { raw: 100000000000000, label: 'Medium holder' },  // 1,000 tokens
      { raw: 10000000000000000, label: 'Large holder' }  // 100,000 tokens
    ];
    
    testBalances.forEach(({ raw, label }) => {
      const tokens = raw / CORRECT_DIVISOR;
      const btcValue = tokens * (tokenData.price / 100_000_000_000);
      
      console.log(`\n${label}:`);
      console.log(`  Raw balance: ${raw}`);
      console.log(`  Actual tokens: ${tokens.toLocaleString()}`);
      console.log(`  BTC value: ${btcValue.toFixed(8)} BTC`);
      console.log(`  % of supply: ${(tokens / TARGET_SUPPLY * 100).toFixed(4)}%`);
    });
    
    // Market cap verification
    console.log('\n=== MARKET CAP VERIFICATION ===');
    const priceInBTC = tokenData.price / 100_000_000_000;
    const calculatedMarketCap = TARGET_SUPPLY * priceInBTC;
    const apiMarketCapBTC = tokenData.marketcap / 100_000_000_000;
    
    console.log(`Price per token: ${priceInBTC.toFixed(10)} BTC`);
    console.log(`Total supply: ${TARGET_SUPPLY.toLocaleString()} tokens`);
    console.log(`Calculated market cap: ${calculatedMarketCap.toFixed(8)} BTC`);
    console.log(`API market cap: ${apiMarketCapBTC.toFixed(8)} BTC`);
    console.log(`Match? ${Math.abs(calculatedMarketCap - apiMarketCapBTC) < 0.00001 ? '✓' : '✗'}`);
    
    // Price conversion formulas
    console.log('\n=== CONVERSION FORMULAS ===');
    console.log('Token amount = raw_balance / 10^11');
    console.log('Price in BTC = price_millisats / 100_000_000_000');
    console.log('Position value = token_amount × price_in_BTC');
    console.log('1 BTC = 100,000,000,000 millisats');
    console.log('1 BTC = 100,000,000 sats');
    console.log('1 sat = 1,000 millisats');
    
  } catch (error) {
    console.error('API test failed:', error.message);
  }
}

verifyTokenMath();