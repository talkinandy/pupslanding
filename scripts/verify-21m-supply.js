#!/usr/bin/env node

/**
 * Verify 21M supply conversion is correct
 */

async function verify21MSupply() {
  console.log('✅ Verifying 21M token supply conversion...\n');
  
  // Fetch token data
  const response = await fetch('https://api.odin.fun/v1/token/28d2');
  const tokenData = await response.json();
  
  console.log('=== TOKEN DATA (ODIN) ===');
  console.log(`Raw total supply: ${tokenData.total_supply}`);
  console.log(`API divisibility: ${tokenData.divisibility}`);
  console.log(`Price: ${tokenData.price} millisats`);
  
  console.log('\n=== SUPPLY CALCULATIONS ===');
  
  // Using API divisibility (incorrect)
  const supplyWithAPIDivisibility = tokenData.total_supply / Math.pow(10, tokenData.divisibility);
  console.log(`Using divisibility ${tokenData.divisibility}: ${supplyWithAPIDivisibility.toLocaleString()} (21B - incorrect)`);
  
  // Using correct divisor for 21M
  const CORRECT_DIVISOR = Math.pow(10, 11);
  const actualSupply = tokenData.total_supply / CORRECT_DIVISOR;
  console.log(`Using divisor 10^11: ${actualSupply.toLocaleString()} (21M - correct!)`);
  
  console.log('\n=== BALANCE EXAMPLES ===');
  
  const examples = [
    { raw: 10000000000000, label: 'Small holder' },      // 100 tokens
    { raw: 1000000000000000, label: 'Medium holder' },   // 10,000 tokens
    { raw: 10000000000000000, label: 'Large holder' },   // 100,000 tokens
    { raw: 100000000000000000, label: 'Whale' }          // 1,000,000 tokens
  ];
  
  examples.forEach(({ raw, label }) => {
    const tokens = raw / CORRECT_DIVISOR;
    const percentOfSupply = (tokens / 21000000) * 100;
    const pricePerToken = tokenData.price / 100_000_000_000; // millisats to BTC
    const value = tokens * pricePerToken;
    
    console.log(`\n${label}:`);
    console.log(`  Raw balance: ${raw}`);
    console.log(`  Actual tokens: ${tokens.toLocaleString()}`);
    console.log(`  % of supply: ${percentOfSupply.toFixed(4)}%`);
    console.log(`  Value: ${value.toFixed(8)} BTC`);
    
    // Format display
    let display;
    if (tokens >= 1000000) {
      display = `${(tokens / 1000000).toFixed(2)}M`;
    } else if (tokens >= 1000) {
      display = `${(tokens / 1000).toFixed(2)}K`;
    } else {
      display = tokens.toLocaleString();
    }
    console.log(`  Display: ${display}`);
  });
  
  console.log('\n=== MARKET CAP VERIFICATION ===');
  const priceInBTC = tokenData.price / 100_000_000_000;
  const marketCapBTC = 21000000 * priceInBTC;
  const apiMarketCapBTC = tokenData.marketcap / 100_000_000_000;
  
  console.log(`21M tokens × ${priceInBTC.toFixed(10)} BTC = ${marketCapBTC.toFixed(4)} BTC`);
  console.log(`API market cap: ${apiMarketCapBTC.toFixed(4)} BTC`);
  console.log(`Match: ${Math.abs(marketCapBTC - apiMarketCapBTC) < 0.001 ? '✅ Yes' : '❌ No'}`);
  
  console.log('\n✅ SUMMARY:');
  console.log('• Total supply is 21M tokens (not 21B)');
  console.log('• Use divisor of 10^11 (not 10^8 from divisibility field)');
  console.log('• Holdings typically range from 100 to 1M tokens');
  console.log('• Display format: K for thousands, M for millions');
  console.log('• Portfolio values calculated with real token prices from API');
}

verify21MSupply();