const puppeteer = require('puppeteer');

async function scrapeOdinAPI() {
  console.log('🚀 Launching browser to access Odin API documentation...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set a longer timeout for complex pages
    page.setDefaultNavigationTimeout(60000);
    
    console.log('📄 Navigating to Odin API docs...');
    await page.goto('https://api.odin.fun/v1/open-api#/', {
      waitUntil: 'networkidle2'
    });

    // Wait for Swagger UI to load
    console.log('⏳ Waiting for Swagger UI to load...');
    await page.waitForSelector('.swagger-ui', { timeout: 30000 });
    
    // Wait a bit more for content to render
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract all API endpoints
    console.log('🔍 Extracting API endpoints...');
    
    const endpoints = await page.evaluate(() => {
      const results = [];
      
      // Look for operation blocks in Swagger UI
      const operations = document.querySelectorAll('.opblock');
      
      operations.forEach(operation => {
        try {
          const method = operation.querySelector('.opblock-summary-method')?.textContent?.trim();
          const path = operation.querySelector('.opblock-summary-path')?.textContent?.trim();
          const summary = operation.querySelector('.opblock-summary-description')?.textContent?.trim();
          const tag = operation.querySelector('.opblock-tag')?.textContent?.trim();
          
          if (method && path) {
            results.push({
              method: method,
              path: path,
              summary: summary || '',
              tag: tag || ''
            });
          }
        } catch (e) {
          console.log('Error parsing operation:', e);
        }
      });

      // Also try to find endpoints in a different structure
      const pathItems = document.querySelectorAll('.opblock-summary');
      pathItems.forEach(item => {
        try {
          const methodEl = item.querySelector('.opblock-summary-method');
          const pathEl = item.querySelector('.opblock-summary-path span');
          const descEl = item.querySelector('.opblock-summary-description');
          
          if (methodEl && pathEl) {
            const method = methodEl.textContent?.trim();
            const path = pathEl.textContent?.trim();
            const description = descEl?.textContent?.trim() || '';
            
            if (method && path && !results.some(r => r.method === method && r.path === path)) {
              results.push({
                method: method,
                path: path,
                summary: description,
                tag: ''
              });
            }
          }
        } catch (e) {
          console.log('Error parsing path item:', e);
        }
      });

      return results;
    });

    console.log(`✅ Found ${endpoints.length} API endpoints`);
    
    if (endpoints.length === 0) {
      // Try alternative selectors
      console.log('🔄 Trying alternative extraction methods...');
      
      const alternativeEndpoints = await page.evaluate(() => {
        const results = [];
        
        // Look for any element containing API paths
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(el => {
          const text = el.textContent;
          if (text && text.includes('/v1/') && text.length < 200) {
            // Extract potential API paths
            const matches = text.match(/\/v1\/[^\s\n\r]+/g);
            if (matches) {
              matches.forEach(match => {
                if (!results.includes(match)) {
                  results.push({
                    method: 'UNKNOWN',
                    path: match,
                    summary: 'Found in page content',
                    tag: ''
                  });
                }
              });
            }
          }
        });
        
        return results;
      });
      
      endpoints.push(...alternativeEndpoints);
      console.log(`📝 Total endpoints found: ${endpoints.length}`);
    }

    // Filter for volume-related endpoints
    const volumeEndpoints = endpoints.filter(endpoint => {
      const searchText = (endpoint.path + ' ' + endpoint.summary + ' ' + endpoint.tag).toLowerCase();
      return searchText.includes('volume') || 
             searchText.includes('stats') || 
             searchText.includes('metrics') ||
             searchText.includes('analytics') ||
             searchText.includes('trading') ||
             searchText.includes('market');
    });

    console.log('\n📊 Volume-related endpoints:');
    if (volumeEndpoints.length > 0) {
      volumeEndpoints.forEach((endpoint, index) => {
        console.log(`${index + 1}. ${endpoint.method} ${endpoint.path}`);
        if (endpoint.summary) {
          console.log(`   Summary: ${endpoint.summary}`);
        }
      });
    } else {
      console.log('❌ No volume-specific endpoints found');
    }

    console.log('\n📋 All available endpoints:');
    endpoints.forEach((endpoint, index) => {
      console.log(`${index + 1}. ${endpoint.method} ${endpoint.path} - ${endpoint.summary}`);
    });

    // Try to get more detailed info about the API
    console.log('\n🔎 Looking for API base information...');
    const apiInfo = await page.evaluate(() => {
      const info = {};
      
      // Look for API title and description
      const title = document.querySelector('.info .title')?.textContent?.trim();
      const description = document.querySelector('.info .description')?.textContent?.trim();
      const version = document.querySelector('.info .version')?.textContent?.trim();
      
      if (title) info.title = title;
      if (description) info.description = description;
      if (version) info.version = version;
      
      return info;
    });

    if (Object.keys(apiInfo).length > 0) {
      console.log('📖 API Information:', apiInfo);
    }

    return { endpoints, volumeEndpoints, apiInfo };

  } catch (error) {
    console.error('❌ Error scraping API documentation:', error.message);
    
    // Take a screenshot for debugging
    try {
      await page.screenshot({ path: 'odin-api-debug.png', fullPage: true });
      console.log('📸 Debug screenshot saved as odin-api-debug.png');
    } catch (screenshotError) {
      console.log('Could not save screenshot');
    }
    
    return { endpoints: [], volumeEndpoints: [], apiInfo: {}, error: error.message };
  } finally {
    await browser.close();
  }
}

// Run the scraper
scrapeOdinAPI().then(result => {
  if (result.error) {
    console.error('Failed to scrape API docs:', result.error);
    process.exit(1);
  }
  
  console.log('\n✅ API documentation scraping completed');
  
  if (result.volumeEndpoints.length > 0) {
    console.log(`\n🎯 Next step: Use these ${result.volumeEndpoints.length} volume-related endpoints to fetch data`);
    result.volumeEndpoints.forEach(endpoint => {
      console.log(`- Try: ${endpoint.method} https://api.odin.fun${endpoint.path}`);
    });
  } else {
    console.log('\n💡 Suggested endpoints to try for volume data:');
    result.endpoints.slice(0, 5).forEach(endpoint => {
      console.log(`- ${endpoint.method} https://api.odin.fun${endpoint.path}`);
    });
  }
}).catch(console.error);