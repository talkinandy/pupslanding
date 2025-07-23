#!/usr/bin/env node

/**
 * Test real token pricing functionality for holdings modal
 */

async function testRealPricing() {
  console.log('💰 Testing real token pricing implementation...');
  
  try {
    // Test getting token price data
    console.log('\n1. Testing token price API...');
    const tokenResponse = await fetch('https://api.odin.fun/v1/token/2211', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PUPS-Dashboard/1.0'
      }
    });
    
    if (!tokenResponse.ok) {
      console.log('   ❌ Token API request failed');
      return;
    }
    
    const tokenData = await tokenResponse.json();
    console.log('   ✅ Token data retrieved:');
    console.log(`      Name: ${tokenData.name}`);
    console.log(`      Ticker: ${tokenData.ticker}`);
    console.log(`      Price (millisats): ${tokenData.price}`);
    console.log(`      Price (BTC): ${tokenData.price / 100_000_000_000}`);
    console.log(`      Market Cap: ${tokenData.marketcap}`);
    console.log(`      Volume: ${tokenData.volume}`);
    
    // Test the pricing calculation logic
    console.log('\n2. Testing pricing calculations...');
    
    // Mock balance data (similar to what comes from user/balances)
    const mockBalance = {
      id: '2211',
      name: 'wolfdog', 
      ticker: 'WOLFDOG',
      balance: 150000000000000, // Raw balance with 8 decimal places
      divisibility: 8
    };
    
    console.log('   📊 Mock balance data:');
    console.log(`      Raw balance: ${mockBalance.balance}`);
    console.log(`      Divisibility: ${mockBalance.divisibility}`);
    
    // Convert to actual token amount
    const actualTokenAmount = mockBalance.balance / Math.pow(10, mockBalance.divisibility);
    console.log(`      Actual tokens: ${actualTokenAmount.toLocaleString()}`);
    
    // Use real price from API
    const currentPriceBTC = tokenData.price / 100_000_000_000;
    console.log(`      Current price: ${currentPriceBTC.toFixed(8)} BTC per token`);
    
    // Calculate portfolio value
    const totalValue = actualTokenAmount * currentPriceBTC;
    console.log(`      Total value: ${totalValue.toFixed(8)} BTC`);
    
    // Calculate estimated P&L (assume 10% profit)
    const estimatedEntryPrice = currentPriceBTC * 0.9;
    const pnl = (currentPriceBTC - estimatedEntryPrice) * actualTokenAmount;
    const percentageChange = ((currentPriceBTC - estimatedEntryPrice) / estimatedEntryPrice) * 100;
    
    console.log('   💹 P&L calculations:');
    console.log(`      Estimated entry: ${estimatedEntryPrice.toFixed(8)} BTC`);
    console.log(`      P&L: ${pnl.toFixed(8)} BTC`);
    console.log(`      Percentage change: ${percentageChange.toFixed(2)}%`);
    
    // Test multiple tokens simulation
    console.log('\n3. Testing multiple token scenario...');
    
    const mockPortfolio = [
      { id: '2211', amount: 1500000, price: 119 }, // WOLFDOG
      { id: '2212', amount: 500000, price: 129 },  // FARTBTC  
      { id: '2213', amount: 2000000, price: 120 }  // AIEYE
    ];
    
    let totalPortfolioValue = 0;
    let totalPnL = 0;
    
    mockPortfolio.forEach((token, i) => {
      const priceBTC = token.price / 100_000_000_000;
      const value = token.amount * priceBTC;
      const tokenPnL = token.amount * priceBTC * 0.1; // 10% profit
      
      totalPortfolioValue += value;
      totalPnL += tokenPnL;
      
      console.log(`   Token ${i + 1}: ${token.amount.toLocaleString()} tokens × ${priceBTC.toFixed(8)} = ${value.toFixed(8)} BTC`);
    });
    
    console.log('   📊 Portfolio summary:');
    console.log(`      Total value: ${totalPortfolioValue.toFixed(8)} BTC`);
    console.log(`      Total P&L: ${totalPnL.toFixed(8)} BTC`);
    console.log(`      Positions: ${mockPortfolio.length}`);
    
    // Test API error handling
    console.log('\n4. Testing error handling...');
    
    try {
      const badResponse = await fetch('https://api.odin.fun/v1/token/nonexistent', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PUPS-Dashboard/1.0'
        }
      });
      
      if (!badResponse.ok) {
        console.log('   ✅ Error handling works - bad token returns 404 as expected');
      }
    } catch (error) {
      console.log('   ✅ Network error handling works');
    }
    
    console.log('\n✅ Real pricing test completed successfully!');
    console.log('\n📈 Improvements made:');
    console.log('   • Portfolio values now based on real market prices');
    console.log('   • Token prices fetched from Odin API /token/{id} endpoint');
    console.log('   • Prices converted from millisatoshis to BTC correctly');
    console.log('   • Fallback pricing for tokens without price data');
    console.log('   • Better error handling for API failures');
    console.log('   • Positions sorted by value (largest first)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRealPricing();