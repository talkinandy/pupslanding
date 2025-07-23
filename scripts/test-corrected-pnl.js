#!/usr/bin/env node

/**
 * Test corrected P&L conversions
 */

async function testCorrectedPnL() {
  console.log('🔧 Testing corrected P&L conversions...\n');
  
  const testTrader = 'rrgza-asmuz-h6jnr-u3mva-pd7mc-unfha-6pepg-r7kdx-honsb-67run-dqe';
  const testToken = '2dyb';
  
  try {
    const [realizedResponse, unrealizedResponse] = await Promise.all([
      fetch(`https://api.odin.fun/v1/user/${testTrader}/token/${testToken}/realized_pnl`),
      fetch(`https://api.odin.fun/v1/user/${testTrader}/token/${testToken}/unrealized_pnl`)
    ]);
    
    const realizedData = await realizedResponse.json();
    const unrealizedData = await unrealizedResponse.json();
    
    console.log('=== RAW API DATA ===');
    console.log('Realized:');
    console.log(`  realized_pnl: ${realizedData.data.realized_pnl}`);
    console.log(`  display_realized_pnl: ${realizedData.data.display_realized_pnl}`);
    
    console.log('\nUnrealized:');
    console.log(`  unrealized_pnl: ${unrealizedData.data.unrealized_pnl}`);
    console.log(`  display_unrealized_pnl: ${unrealizedData.data.display_unrealized_pnl}`);
    
    console.log('\n=== CORRECTED CONVERSIONS ===');
    
    // Corrected conversions (what our modal will use)
    const realizedPnL = realizedData.data.realized_pnl / 100_000_000_000;
    const unrealizedPnL = unrealizedData.data.unrealized_pnl / 100_000_000_000;
    const totalPnL = realizedPnL + unrealizedPnL;
    
    console.log(`Realized P&L: ${realizedPnL.toFixed(8)} BTC`);
    console.log(`Unrealized P&L: ${unrealizedPnL.toFixed(8)} BTC`);
    console.log(`Total P&L: ${totalPnL.toFixed(8)} BTC`);
    
    console.log('\n=== COMPARISON ===');
    console.log('API display vs Our conversion:');
    console.log(`Realized: ${realizedData.data.display_realized_pnl} vs ${realizedPnL.toFixed(8)}`);
    console.log(`Unrealized: ${unrealizedData.data.display_unrealized_pnl} vs ${unrealizedPnL.toFixed(8)}`);
    
    // Test if our conversion matches the display for realized (which should be correct)
    const realizedMatch = Math.abs(realizedData.data.display_realized_pnl - realizedPnL) < 0.00000001;
    console.log(`\nRealized P&L conversion correct: ${realizedMatch ? '✅' : '❌'}`);
    
    console.log('\n=== ENTRY PRICE VERIFICATION ===');
    const avgBuyPrice = unrealizedData.data.avg_buy_price / 100_000_000_000;
    console.log(`Avg buy price: ${unrealizedData.data.avg_buy_price} millisats = ${avgBuyPrice.toFixed(10)} BTC`);
    console.log(`API display: ${unrealizedData.data.display_avg_buy_price} millisats`);
    
    const holdings = unrealizedData.data.display_unrealized_quantity;
    const currentPrice = unrealizedData.data.token_price / 100_000_000_000;
    const currentValue = holdings * currentPrice;
    
    console.log(`\nCurrent holdings: ${holdings.toLocaleString()} tokens`);
    console.log(`Current price: ${currentPrice.toFixed(10)} BTC per token`);
    console.log(`Current value: ${currentValue.toFixed(8)} BTC`);
    
    // Manual P&L calculation
    const costBasis = holdings * avgBuyPrice;
    const manualUnrealizedPnL = currentValue - costBasis;
    
    console.log(`\nManual calculation:`);
    console.log(`Cost basis: ${costBasis.toFixed(8)} BTC`);
    console.log(`Current value: ${currentValue.toFixed(8)} BTC`);
    console.log(`Manual unrealized P&L: ${manualUnrealizedPnL.toFixed(8)} BTC`);
    console.log(`API unrealized P&L: ${unrealizedPnL.toFixed(8)} BTC`);
    
    console.log('\n✅ FIXES IMPLEMENTED:');
    console.log('• Use raw realized_pnl and unrealized_pnl values');
    console.log('• Convert from millisats to BTC (÷ 100,000,000,000)');
    console.log('• Use avg_buy_price for accurate entry prices');
    console.log('• Show both realized and unrealized P&L separately');
    console.log('• Calculate total P&L as sum of both components');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCorrectedPnL().catch(console.error);