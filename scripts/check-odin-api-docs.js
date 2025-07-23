#!/usr/bin/env node

/**
 * Check Odin API documentation for proper trade endpoint parameters
 */

const puppeteer = require('puppeteer');

async function checkOdinAPIDocs() {
  console.log('📚 Checking Odin API Documentation');
  console.log('==================================\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('🚀 Navigating to Odin API documentation...');
    await page.goto('https://api.odin.fun/v1/open-api#/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    console.log('🔍 Looking for trades endpoint documentation...');
    
    // Look for trades endpoint documentation
    const content = await page.content();
    
    // Extract information about trades endpoint
    const tradesEndpointRegex = /\/trades.*?(?=\/|\n|\r)/gi;
    const tradesMatches = content.match(tradesEndpointRegex);
    
    if (tradesMatches) {
      console.log('✅ Found trades endpoint references:');
      tradesMatches.slice(0, 5).forEach((match, i) => {
        console.log(`   ${i + 1}. ${match}`);
      });
    }
    
    // Look for parameter documentation
    console.log('\n🔍 Looking for parameter documentation...');
    
    // Try to find parameter sections
    const parameterSelectors = [
      '[class*="parameter"]',
      '[class*="param"]',
      '.swagger-ui .parameters',
      '.parameter-item',
      'table tbody tr',
      '[data-testid*="parameter"]'
    ];
    
    for (const selector of parameterSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`✅ Found ${elements.length} parameter elements with selector: ${selector}`);
          
          // Extract text from first few elements
          for (let i = 0; i < Math.min(3, elements.length); i++) {
            const text = await elements[i].evaluate(el => el.textContent?.trim());
            if (text && text.length > 0 && text.length < 300) {
              console.log(`   ${i + 1}. "${text}"`);
            }
          }
        }
      } catch (error) {
        // Selector might not exist, continue
      }
    }
    
    // Look specifically for sort/time related parameters
    console.log('\n🔍 Searching for sort/time parameters...');
    
    const sortKeywords = ['sort', 'order', 'time', 'desc', 'asc', 'created_at', 'timestamp'];
    
    for (const keyword of sortKeywords) {
      const regex = new RegExp(`[^\\w]${keyword}[^\\w].*?(?=\\n|\\r|$)`, 'gi');
      const matches = content.match(regex);
      
      if (matches && matches.length > 0) {
        console.log(`✅ Found "${keyword}" references:`);
        matches.slice(0, 3).forEach((match, i) => {
          console.log(`   ${i + 1}. ${match.trim()}`);
        });
      }
    }
    
    // Look for Swagger UI specific elements
    console.log('\n🔍 Looking for Swagger UI documentation structure...');
    
    const swaggerSelectors = [
      '.swagger-ui .opblock',
      '.swagger-ui .operation-tag-content',
      '[class*="opblock"]',
      '[class*="operation"]'
    ];
    
    for (const selector of swaggerSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`✅ Found ${elements.length} Swagger elements with: ${selector}`);
        }
      } catch (error) {
        // Continue
      }
    }
    
    // Try to click on trades endpoint if it exists
    console.log('\n🔍 Trying to find and interact with trades endpoint...');
    
    const clickableSelectors = [
      'text="/trades"',
      '[href*="trades"]',
      'button:has-text("trades")',
      '.opblock-summary-path:has-text("trades")'
    ];
    
    for (const selector of clickableSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`✅ Found clickable trades element: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          
          // Look for expanded documentation
          const expandedContent = await page.content();
          
          // Look for parameter table after clicking
          const parameterTableRegex = /<table[^>]*>.*?<\/table>/gis;
          const tables = expandedContent.match(parameterTableRegex);
          
          if (tables) {
            console.log(`   📊 Found ${tables.length} tables after expanding`);
            // Extract table content that might contain parameters
            for (let i = 0; i < Math.min(2, tables.length); i++) {
              // Remove HTML tags and extract text
              const tableText = tables[i].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
              if (tableText.includes('sort') || tableText.includes('time') || tableText.includes('order')) {
                console.log(`   📋 Table ${i + 1} (contains sort/time): ${tableText.slice(0, 200)}...`);
              }
            }
          }
          break;
        }
      } catch (error) {
        // Continue trying other selectors
      }
    }
    
    // Take a screenshot for manual inspection
    console.log('\n📸 Taking screenshot for manual inspection...');
    await page.screenshot({ 
      path: '/Users/Andy/Cursor/pupslanding/scripts/odin-api-docs-screenshot.png',
      fullPage: true 
    });
    console.log('   ✅ Screenshot saved as odin-api-docs-screenshot.png');
    
    // Try to extract the raw OpenAPI spec
    console.log('\n📄 Trying to extract OpenAPI specification...');
    
    // Look for JSON or YAML in the page
    const scripts = await page.$$eval('script', scripts => 
      scripts.map(script => script.textContent).filter(text => 
        text && (text.includes('openapi') || text.includes('swagger') || text.includes('/trades'))
      )
    );
    
    if (scripts.length > 0) {
      console.log(`✅ Found ${scripts.length} relevant scripts`);
      scripts.slice(0, 2).forEach((script, i) => {
        // Look for trades endpoint definition
        const tradesMatch = script.match(/"\/trades"[\s\S]*?"parameters"[\s\S]*?\]/);
        if (tradesMatch) {
          console.log(`   📋 Script ${i + 1} trades parameters: ${tradesMatch[0].slice(0, 500)}...`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Documentation check failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Also try direct API call to get OpenAPI spec
async function tryDirectAPISpec() {
  console.log('\n🔗 Trying direct OpenAPI spec endpoints...');
  
  const specEndpoints = [
    'https://api.odin.fun/v1/open-api.json',
    'https://api.odin.fun/v1/openapi.json',
    'https://api.odin.fun/v1/swagger.json',
    'https://api.odin.fun/v1/docs.json',
    'https://api.odin.fun/openapi.json',
    'https://api.odin.fun/swagger.json'
  ];
  
  for (const endpoint of specEndpoints) {
    try {
      console.log(`   Testing: ${endpoint}`);
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const spec = await response.json();
        console.log(`   ✅ Found OpenAPI spec at: ${endpoint}`);
        
        // Look for trades endpoint
        if (spec.paths && spec.paths['/trades']) {
          console.log('   📋 Trades endpoint parameters:');
          const tradesSpec = spec.paths['/trades'];
          
          if (tradesSpec.get && tradesSpec.get.parameters) {
            tradesSpec.get.parameters.forEach((param, i) => {
              console.log(`      ${i + 1}. ${param.name} (${param.type || param.schema?.type}): ${param.description || 'No description'}`);
            });
          }
        }
        
        // Save the spec for detailed analysis
        const fs = require('fs');
        fs.writeFileSync('/Users/Andy/Cursor/pupslanding/scripts/odin-openapi-spec.json', JSON.stringify(spec, null, 2));
        console.log('   ✅ OpenAPI spec saved as odin-openapi-spec.json');
        break;
      } else {
        console.log(`   ❌ HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

async function main() {
  await checkOdinAPIDocs();
  await tryDirectAPISpec();
  
  console.log('\n✅ Documentation Analysis Complete');
  console.log('==================================');
  console.log('• Screenshot saved for manual review');
  console.log('• Check odin-openapi-spec.json if found');
  console.log('• Look for sort/time parameters in the output above');
}

if (require.main === module) {
  main();
}