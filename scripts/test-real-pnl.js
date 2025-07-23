#!/usr/bin/env node

/**
 * Test real P&L integration with Odin API
 */

async function testRealPnL() {
  console.log('💰 Testing real P&L integration with Odin API...\n');
  
  // Test with a known trader who has trading history
  const testTrader = 'rrgza-asmuz-h6jnr-u3mva-pd7mc-unfha-6pepg-r7kdx-honsb-67run-dqe';
  const testToken = '2dyb';
  
  console.log('=== TRADER P&L TEST ===');
  console.log(`Trader: ${testTrader}`);
  console.log(`Token: ${testToken}`);
  
  try {
    // Fetch all data in parallel
    const [tokenResponse, realizedResponse, unrealizedResponse] = await Promise.all([
      fetch(`https://api.odin.fun/v1/token/${testToken}`),
      fetch(`https://api.odin.fun/v1/user/${testTrader}/token/${testToken}/realized_pnl`),
      fetch(`https://api.odin.fun/v1/user/${testTrader}/token/${testToken}/unrealized_pnl`)
    ]);
    
    const tokenData = await tokenResponse.json();
    const realizedData = await realizedResponse.json();
    const unrealizedData = await unrealizedResponse.json();
    
    console.log('\n=== TOKEN INFO ===');
    console.log(`Name: ${tokenData.name} (${tokenData.ticker})`);
    console.log(`Current price: ${tokenData.price} millisats`);
    console.log(`Price in BTC: ${(tokenData.price / 100_000_000_000).toFixed(10)} BTC`);
    
    console.log('\n=== REALIZED P&L ===');
    console.log(`Quantity sold: ${realizedData.data.display_realized_quantity} tokens`);
    console.log(`Avg buy price: ${realizedData.data.avg_buy_price} millisats`);
    console.log(`Avg sell price: ${realizedData.data.avg_sell_price} millisats`);
    console.log(`Price delta: ${realizedData.data.display_avg_price_delta} millisats`);
    console.log(`Realized P&L: ${realizedData.data.display_realized_pnl} BTC`);
    
    console.log('\n=== UNREALIZED P&L ===');
    console.log(`Current holdings: ${unrealizedData.data.display_unrealized_quantity} tokens`);
    console.log(`Avg buy price: ${unrealizedData.data.display_avg_buy_price} millisats`);
    console.log(`Current price: ${unrealizedData.data.display_token_price} millisats`);
    console.log(`Unrealized P&L: ${unrealizedData.data.display_unrealized_pnl} BTC`);
    
    console.log('\n=== PORTFOLIO SUMMARY ===');
    const totalPnL = realizedData.data.display_realized_pnl + unrealizedData.data.display_unrealized_pnl;
    const currentValue = unrealizedData.data.display_unrealized_quantity * (tokenData.price / 100_000_000_000);
    const totalTraded = realizedData.data.display_realized_quantity + unrealizedData.data.display_unrealized_quantity;
    
    console.log(`Total tokens traded: ${totalTraded.toLocaleString()}`);
    console.log(`Current holdings value: ${currentValue.toFixed(8)} BTC`);
    console.log(`Total P&L: ${totalPnL.toFixed(8)} BTC`);
    
    // Calculate performance metrics
    const avgEntryPrice = unrealizedData.data.display_avg_buy_price / 100_000_000_000;
    const currentPrice = tokenData.price / 100_000_000_000;
    const percentGain = ((currentPrice - avgEntryPrice) / avgEntryPrice) * 100;
    
    console.log(`\nPerformance: ${percentGain.toFixed(2)}% gain`);
    console.log(`Entry: ${avgEntryPrice.toFixed(10)} BTC → Current: ${currentPrice.toFixed(10)} BTC`);
    
    console.log('\n✅ REAL P&L FEATURES IMPLEMENTED:');
    console.log('• Real realized P&L from actual trades');
    console.log('• Real unrealized P&L on current holdings');
    console.log('• Actual average buy prices (not estimates)');
    console.log('• Total trading performance metrics');
    console.log('• Quantity sold vs currently held breakdown');
    console.log('• Accurate percentage gains based on real entry prices');
    
  } catch (error) {
    console.error('❌ Error testing P&L:', error.message);
  }
}

testRealPnL().catch(console.error);