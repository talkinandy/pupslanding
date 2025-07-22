const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function analyzeThorInterface() {
  console.log('🚀 Launching browser to analyze Thor.odinsson.xyz...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const thorData = {
    url: 'https://thor.odinsson.xyz/',
    sections: [],
    dataPoints: [],
    charts: [],
    statistics: [],
    features: [],
    apiEndpointsNeeded: []
  };

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);

    console.log('📄 Navigating to Thor.odinsson.xyz...');
    await page.goto('https://thor.odinsson.xyz/', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Take screenshot
    await page.screenshot({ path: 'thor-interface.png', fullPage: true });
    console.log('📸 Screenshot saved as thor-interface.png');

    // Analyze the page structure and content
    const pageAnalysis = await page.evaluate(() => {
      const analysis = {
        title: document.title,
        sections: [],
        statistics: [],
        dataElements: [],
        charts: [],
        tables: [],
        textContent: []
      };

      // Get all text content on the page
      const allText = document.body.innerText;
      
      // Look for statistics/numbers
      const numberPatterns = allText.match(/[\d,]+\.?\d*\s*(BTC|USD|%|M|K|B|tokens?|users?|volume|txns?|transactions?)/gi);
      if (numberPatterns) {
        analysis.statistics = numberPatterns.map(stat => stat.trim());
      }

      // Look for sections
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="heading"]');
      headings.forEach(heading => {
        const text = heading.textContent.trim();
        if (text.length > 0 && text.length < 100) {
          analysis.sections.push({
            level: heading.tagName,
            text: text,
            className: heading.className
          });
        }
      });

      // Look for data display elements
      const dataElements = document.querySelectorAll('[class*="stat"], [class*="metric"], [class*="value"], [class*="data"], [class*="number"]');
      dataElements.forEach(el => {
        const text = el.textContent.trim();
        if (text.length > 0 && text.length < 200) {
          analysis.dataElements.push({
            text: text,
            className: el.className,
            parentText: el.parentElement?.textContent?.trim()
          });
        }
      });

      // Look for charts
      const chartElements = document.querySelectorAll('canvas, svg[class*="chart"], [class*="chart"], [class*="graph"]');
      analysis.charts = Array.from(chartElements).map(chart => ({
        type: chart.tagName,
        className: chart.className,
        id: chart.id,
        parentClass: chart.parentElement?.className
      }));

      // Look for tables
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
        const firstRowData = Array.from(table.querySelectorAll('tbody tr:first-child td')).map(td => td.textContent.trim());
        analysis.tables.push({
          headers: headers,
          sampleRow: firstRowData,
          rowCount: table.querySelectorAll('tbody tr').length
        });
      });

      // Look for specific Thor features
      const specificElements = {
        volumeData: document.querySelector('[class*="volume"]')?.textContent,
        userCount: document.querySelector('[class*="user"]')?.textContent,
        tokenCount: document.querySelector('[class*="token"]')?.textContent,
        transactionData: document.querySelector('[class*="transaction"]')?.textContent,
        priceData: Array.from(document.querySelectorAll('[class*="price"]')).map(el => el.textContent.trim()),
        percentageData: Array.from(document.querySelectorAll('[class*="percent"], [class*="change"]')).map(el => el.textContent.trim())
      };

      analysis.specificElements = specificElements;

      // Get all visible text to understand what data is shown
      const visibleText = [];
      const textNodes = document.evaluate('//text()[normalize-space(.) != ""]', document.body, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
      for (let i = 0; i < Math.min(textNodes.snapshotLength, 100); i++) {
        const text = textNodes.snapshotItem(i).textContent.trim();
        if (text.length > 5 && text.length < 200) {
          visibleText.push(text);
        }
      }
      analysis.textContent = visibleText;

      return analysis;
    });

    thorData.analysis = pageAnalysis;

    // Try to identify specific data categories
    console.log('\n🔍 Analyzing data categories...');
    
    // Categorize findings
    const dataCategories = {
      platformStats: [],
      tokenMetrics: [],
      userActivity: [],
      volumeData: [],
      priceData: [],
      percentageChanges: []
    };

    // Process statistics
    if (pageAnalysis.statistics) {
      pageAnalysis.statistics.forEach(stat => {
        if (stat.includes('BTC') || stat.includes('volume')) {
          dataCategories.volumeData.push(stat);
        } else if (stat.includes('%')) {
          dataCategories.percentageChanges.push(stat);
        } else if (stat.includes('user')) {
          dataCategories.userActivity.push(stat);
        } else if (stat.includes('token')) {
          dataCategories.tokenMetrics.push(stat);
        } else {
          dataCategories.platformStats.push(stat);
        }
      });
    }

    thorData.categorizedData = dataCategories;

    // Map to Odin API endpoints
    console.log('\n🔗 Mapping to Odin API endpoints...');
    
    const apiMapping = {
      canRecreate: [],
      cannotRecreate: [],
      endpointsNeeded: []
    };

    // Based on our known Odin API endpoints, determine what we can recreate
    const knownEndpoints = [
      { endpoint: '/v1/statistics/dashboard', provides: ['platform volume', 'user count', 'token count', '24h volume'] },
      { endpoint: '/v1/tokens', provides: ['token list', 'market cap', 'price', 'age'] },
      { endpoint: '/v1/token/{id}', provides: ['individual token data', 'price', 'volume', 'holders'] },
      { endpoint: '/v1/trades', provides: ['recent trades', 'trade volume', 'trade count'] },
      { endpoint: '/v1/token/{id}/trades', provides: ['token-specific trades'] },
      { endpoint: '/v1/user/{principal}/stats', provides: ['user statistics'] },
      { endpoint: '/v1/activities', provides: ['platform activities'] }
    ];

    // Check what Thor displays vs what we can get
    if (dataCategories.platformStats.length > 0) {
      apiMapping.canRecreate.push({
        thorFeature: 'Platform Statistics',
        odinEndpoint: '/v1/statistics/dashboard',
        confidence: 'HIGH'
      });
    }

    if (dataCategories.volumeData.length > 0) {
      apiMapping.canRecreate.push({
        thorFeature: 'Volume Data',
        odinEndpoint: '/v1/statistics/dashboard + /v1/trades',
        confidence: 'HIGH'
      });
    }

    if (dataCategories.tokenMetrics.length > 0) {
      apiMapping.canRecreate.push({
        thorFeature: 'Token Metrics',
        odinEndpoint: '/v1/tokens',
        confidence: 'HIGH'
      });
    }

    // Check for features we might not be able to recreate
    if (pageAnalysis.charts.length > 0) {
      apiMapping.cannotRecreate.push({
        thorFeature: 'Advanced Charts',
        reason: 'Would need historical data endpoints',
        workaround: 'Could build from trade history but limited'
      });
    }

    thorData.apiMapping = apiMapping;
    thorData.knownEndpoints = knownEndpoints;

  } catch (error) {
    console.error('❌ Error analyzing Thor interface:', error.message);
    thorData.error = error.message;
  } finally {
    await browser.close();
  }

  // Save detailed analysis
  await fs.writeFile('thor-analysis.json', JSON.stringify(thorData, null, 2));

  // Display findings
  console.log('\n📊 THOR.ODINSSON.XYZ ANALYSIS COMPLETE');
  console.log('=====================================\n');

  if (thorData.analysis) {
    console.log('📋 PAGE SECTIONS FOUND:');
    thorData.analysis.sections.forEach((section, i) => {
      console.log(`${i + 1}. ${section.text} (${section.level})`);
    });

    console.log('\n📊 STATISTICS DETECTED:');
    if (thorData.analysis.statistics) {
      thorData.analysis.statistics.slice(0, 10).forEach((stat, i) => {
        console.log(`${i + 1}. ${stat}`);
      });
    }

    console.log('\n📈 DATA CATEGORIES:');
    Object.entries(thorData.categorizedData).forEach(([category, items]) => {
      if (items.length > 0) {
        console.log(`\n${category.toUpperCase()}:`);
        items.slice(0, 5).forEach(item => console.log(`  - ${item}`));
      }
    });

    console.log('\n✅ CAN RECREATE WITH ODIN API:');
    if (thorData.apiMapping?.canRecreate) {
      thorData.apiMapping.canRecreate.forEach(item => {
        console.log(`- ${item.thorFeature} → ${item.odinEndpoint} (${item.confidence})`);
      });
    }

    console.log('\n❌ CANNOT DIRECTLY RECREATE:');
    if (thorData.apiMapping?.cannotRecreate) {
      thorData.apiMapping.cannotRecreate.forEach(item => {
        console.log(`- ${item.thorFeature}: ${item.reason}`);
        if (item.workaround) console.log(`  Workaround: ${item.workaround}`);
      });
    }
  }

  console.log('\n📁 Full analysis saved to: thor-analysis.json');
  console.log('📸 Screenshot saved as: thor-interface.png');

  return thorData;
}

// Run the analysis
analyzeThorInterface().catch(console.error);