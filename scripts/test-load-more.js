#!/usr/bin/env node

/**
 * Test Load More functionality with mock data
 */

// Simulate the React component logic
function testLoadMoreLogic() {
  console.log('🧪 Testing Load More functionality...');
  
  // Mock data - 200 traders
  const mockTraders = Array.from({ length: 200 }, (_, i) => ({
    rank: i + 1,
    principal: `trader_${i + 1}`,
    name: `Trader ${i + 1}`,
    realizedPnl: Math.random() * 10 - 5,
    unrealizedPnl: Math.random() * 10 - 5,
    totalPnl: Math.random() * 10 - 5
  }));
  
  let visibleCount = 50;
  const filteredTraders = mockTraders;
  
  console.log(`📊 Total traders: ${filteredTraders.length}`);
  console.log(`👁️  Initially visible: ${visibleCount}`);
  
  // Test initial state
  const shouldShowLoadMore = filteredTraders.length > visibleCount;
  const remainingCount = filteredTraders.length - visibleCount;
  
  console.log(`🔘 Show Load More button: ${shouldShowLoadMore}`);
  console.log(`📈 Remaining traders: ${remainingCount}`);
  
  if (shouldShowLoadMore) {
    console.log(`   Button text: "Load More Traders (${remainingCount} remaining)"`);
  }
  
  // Simulate clicking Load More
  console.log('\n🖱️  Simulating Load More click...');
  
  visibleCount = Math.min(visibleCount + 50, filteredTraders.length);
  console.log(`👁️  New visible count: ${visibleCount}`);
  
  const shouldShowLoadMoreAfter = filteredTraders.length > visibleCount;
  const remainingCountAfter = filteredTraders.length - visibleCount;
  
  console.log(`🔘 Show Load More button after click: ${shouldShowLoadMoreAfter}`);
  console.log(`📈 Remaining traders after click: ${remainingCountAfter}`);
  
  if (shouldShowLoadMoreAfter) {
    console.log(`   Button text: "Load More Traders (${remainingCountAfter} remaining)"`);
  }
  
  // Test multiple clicks until all loaded
  console.log('\n🔄 Simulating multiple clicks...');
  let clickCount = 1;
  
  while (visibleCount < filteredTraders.length) {
    visibleCount = Math.min(visibleCount + 50, filteredTraders.length);
    clickCount++;
    console.log(`   Click ${clickCount}: visible=${visibleCount}, remaining=${filteredTraders.length - visibleCount}`);
  }
  
  console.log(`\n✅ All traders loaded after ${clickCount} clicks`);
  console.log(`🎯 Final state: ${visibleCount}/${filteredTraders.length} traders visible`);
  console.log(`🔘 Load More button should be hidden: ${filteredTraders.length <= visibleCount}`);
  
  // Test with search (fewer results)
  console.log('\n🔍 Testing with search filter...');
  const searchResults = mockTraders.slice(0, 75); // Simulate search returning 75 results
  visibleCount = 50; // Reset
  
  console.log(`📊 Search results: ${searchResults.length}`);
  console.log(`👁️  Initially visible: ${visibleCount}`);
  
  const searchShouldShow = searchResults.length > visibleCount;
  const searchRemaining = searchResults.length - visibleCount;
  
  console.log(`🔘 Show Load More with search: ${searchShouldShow}`);
  console.log(`📈 Remaining with search: ${searchRemaining}`);
  
  console.log('\n✅ Load More functionality test completed successfully!');
}

testLoadMoreLogic();