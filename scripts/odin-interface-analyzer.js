const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function analyzeOdinInterface() {
  console.log('🚀 Launching browser to analyze Odin.fun interface...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const analysis = {
    pages: [],
    features: [],
    gaps: [],
    uiElements: [],
    dataDisplayed: [],
    navigationStructure: [],
    screenshots: []
  };

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);

    // Analyze main page
    console.log('📄 Analyzing main page...');
    await page.goto('https://odin.fun', { waitUntil: 'networkidle2' });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot of main page
    await page.screenshot({ path: 'odin-main-page.png', fullPage: true });
    analysis.screenshots.push('odin-main-page.png');

    // Analyze main page structure
    const mainPageAnalysis = await page.evaluate(() => {
      const analysis = {
        title: document.title,
        url: window.location.href,
        sections: [],
        buttons: [],
        links: [],
        dataElements: [],
        charts: [],
        tables: []
      };

      // Get main sections
      const sections = document.querySelectorAll('section, main, div[class*="section"], div[class*="container"]');
      sections.forEach((section, index) => {
        if (section.textContent.trim().length > 50) {
          analysis.sections.push({
            index,
            className: section.className,
            textContent: section.textContent.trim().substring(0, 200),
            hasChart: section.querySelector('canvas, svg') !== null,
            hasTable: section.querySelector('table') !== null
          });
        }
      });

      // Get buttons
      const buttons = document.querySelectorAll('button, a[class*="btn"], [role="button"]');
      buttons.forEach(btn => {
        const text = btn.textContent.trim();
        if (text.length > 0 && text.length < 50) {
          analysis.buttons.push({
            text,
            className: btn.className,
            href: btn.href || null
          });
        }
      });

      // Look for data displays
      const dataElements = document.querySelectorAll('[class*="price"], [class*="volume"], [class*="stat"], [class*="metric"]');
      dataElements.forEach(el => {
        analysis.dataElements.push({
          className: el.className,
          textContent: el.textContent.trim()
        });
      });

      // Check for charts
      const chartElements = document.querySelectorAll('canvas, svg, [class*="chart"]');
      analysis.charts = Array.from(chartElements).map(chart => ({
        tagName: chart.tagName,
        className: chart.className,
        id: chart.id
      }));

      // Check for tables
      const tables = document.querySelectorAll('table');
      tables.forEach((table, index) => {
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
        analysis.tables.push({
          index,
          headers,
          rowCount: table.querySelectorAll('tr').length - 1
        });
      });

      return analysis;
    });

    analysis.pages.push(mainPageAnalysis);

    // Try to find and analyze token listing page
    console.log('🔍 Looking for token listings...');
    
    // Look for links to token pages or listings
    const tokenLinks = await page.evaluate(() => {
      const links = [];
      const anchors = document.querySelectorAll('a');
      anchors.forEach(a => {
        const href = a.href;
        const text = a.textContent.trim().toLowerCase();
        if (href && (
          href.includes('/token') || 
          text.includes('token') || 
          text.includes('rune') ||
          text.includes('trade') ||
          text.includes('market')
        )) {
          links.push({ href, text });
        }
      });
      return links.slice(0, 10); // Limit to first 10
    });

    console.log(`Found ${tokenLinks.length} potential token/market links`);

    // Try to navigate to a token page if available
    if (tokenLinks.length > 0) {
      const tokenLink = tokenLinks.find(link => 
        link.href.includes('/token/') || link.text.includes('trade')
      );
      
      if (tokenLink) {
        console.log(`📊 Analyzing token page: ${tokenLink.href}`);
        try {
          await page.goto(tokenLink.href, { waitUntil: 'networkidle2' });
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          await page.screenshot({ path: 'odin-token-page.png', fullPage: true });
          analysis.screenshots.push('odin-token-page.png');

          const tokenPageAnalysis = await page.evaluate(() => {
            return {
              title: document.title,
              url: window.location.href,
              hasChart: document.querySelector('canvas, svg, [class*="chart"]') !== null,
              hasPriceData: document.querySelector('[class*="price"]') !== null,
              hasVolumeData: document.querySelector('[class*="volume"]') !== null,
              hasTradeHistory: document.querySelector('table, [class*="trade"], [class*="history"]') !== null,
              dataElements: Array.from(document.querySelectorAll('[class*="stat"], [class*="metric"], [class*="data"]'))
                .map(el => ({ className: el.className, text: el.textContent.trim() }))
                .slice(0, 20)
            };
          });

          analysis.pages.push(tokenPageAnalysis);
        } catch (error) {
          console.log('❌ Could not analyze token page:', error.message);
        }
      }
    }

    // Analyze what features are currently available
    console.log('🔍 Analyzing current features...');
    
    analysis.features = [
      ...mainPageAnalysis.buttons.map(btn => `Button: ${btn.text}`),
      ...analysis.pages.flatMap(p => [
        p.hasChart ? 'Price Charts' : null,
        p.hasVolumeData ? 'Volume Data' : null,
        p.hasTradeHistory ? 'Trade History' : null
      ]).filter(Boolean)
    ];

    // Identify potential gaps for analytics
    analysis.gaps = [
      'Advanced Technical Indicators',
      'Portfolio Analytics',
      'Cross-Token Comparisons', 
      'Volume Flow Analysis',
      'Whale Activity Tracking',
      'Market Sentiment Analysis',
      'Risk Assessment Tools',
      'Performance Benchmarking',
      'Liquidity Analysis',
      'Token Correlation Matrix',
      'Historical Performance Trends',
      'Alert System for Price/Volume',
      'Custom Dashboard Creation',
      'Export/Share Analytics'
    ];

  } catch (error) {
    console.error('❌ Error analyzing interface:', error.message);
    analysis.error = error.message;
  } finally {
    await browser.close();
  }

  // Save analysis to file
  await fs.writeFile('odin-interface-analysis.json', JSON.stringify(analysis, null, 2));
  
  console.log('\n📊 ODIN.FUN INTERFACE ANALYSIS COMPLETE');
  console.log('=====================================');
  
  console.log('\n🔍 CURRENT FEATURES IDENTIFIED:');
  analysis.features.forEach((feature, index) => {
    console.log(`${index + 1}. ${feature}`);
  });

  console.log('\n❌ POTENTIAL GAPS FOR ANALYTICS:');
  analysis.gaps.forEach((gap, index) => {
    console.log(`${index + 1}. ${gap}`);
  });

  console.log(`\n📸 Screenshots saved: ${analysis.screenshots.join(', ')}`);
  console.log('📁 Full analysis saved to: odin-interface-analysis.json');

  return analysis;
}

// Run the analysis
analyzeOdinInterface().catch(console.error);