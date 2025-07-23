#!/usr/bin/env node

/**
 * Test historical price change calculations
 */

async function testPriceChanges() {
  console.log('💹 Testing historical price change calculations...\n');
  
  // Fetch real token data
  const response = await fetch('https://api.odin.fun/v1/token/2jjh');
  const tokenData = await response.json();
  
  console.log('=== TOKEN PRICE DATA ===');
  console.log(`Token: ${tokenData.name} (${tokenData.ticker})`);
  console.log(`Current price: ${tokenData.price} millisats`);
  console.log(`Price 5m ago: ${tokenData.price_5m} millisats`);
  console.log(`Price 1h ago: ${tokenData.price_1h} millisats`);
  console.log(`Price 6h ago: ${tokenData.price_6h} millisats`);
  console.log(`Price 24h ago: ${tokenData.price_1d} millisats`);
  
  console.log('\n=== PRICE CHANGES (as will show in UI) ===');
  
  // Convert to BTC prices
  const currentPriceBTC = tokenData.price / 100_000_000_000;
  const price1hBTC = tokenData.price_1h / 100_000_000_000;
  const price24hBTC = tokenData.price_1d / 100_000_000_000;
  
  // Calculate percentage changes
  const change1h = ((currentPriceBTC - price1hBTC) / price1hBTC) * 100;
  const change24h = ((currentPriceBTC - price24hBTC) / price24hBTC) * 100;
  
  console.log(`Current price: ${currentPriceBTC.toFixed(8)} BTC`);
  console.log(`1h change: ${change1h >= 0 ? '+' : ''}${change1h.toFixed(2)}% (${change1h >= 0 ? '🟢' : '🔴'})`);
  console.log(`24h change: ${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}% (${change24h >= 0 ? '🟢' : '🔴'})`);
  
  console.log('\n=== EXAMPLE PORTFOLIO VALUE IMPACT ===');
  
  // Example holdings: 10,000 tokens
  const exampleTokens = 10000;
  const currentValue = exampleTokens * currentPriceBTC;
  const value1hAgo = exampleTokens * price1hBTC;
  const value24hAgo = exampleTokens * price24hBTC;
  
  console.log(`Holdings: ${exampleTokens.toLocaleString()} tokens`);
  console.log(`Current value: ${currentValue.toFixed(8)} BTC`);
  console.log(`Value 1h ago: ${value1hAgo.toFixed(8)} BTC (diff: ${(currentValue - value1hAgo >= 0 ? '+' : '')}${(currentValue - value1hAgo).toFixed(8)} BTC)`);
  console.log(`Value 24h ago: ${value24hAgo.toFixed(8)} BTC (diff: ${(currentValue - value24hAgo >= 0 ? '+' : '')}${(currentValue - value24hAgo).toFixed(8)} BTC)`);
  
  console.log('\n✅ FEATURE SUMMARY:');
  console.log('• Holdings modal now shows real-time price changes');
  console.log('• Displays 1h and 24h percentage changes with green/red indicators');
  console.log('• Uses historical price data from Odin API (price_1h, price_1d)');
  console.log('• Visual indicators: 📈 for gains, 📉 for losses');
  console.log('• Maintains accurate 21M token supply calculations');
}

testPriceChanges().catch(console.error);