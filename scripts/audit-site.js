const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// ANSI color codes for better console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

class SiteAuditor {
  constructor() {
    this.results = {
      errors: [],
      warnings: [],
      networkFailures: [],
      brokenLinks: [],
      missingAssets: [],
      performanceMetrics: {},
      accessibilityIssues: [],
      timestamp: new Date().toISOString()
    };
  }

  async audit(baseUrl = 'http://localhost:3000') {
    console.log(`${colors.blue}🔍 Starting site audit for ${baseUrl}...${colors.reset}\n`);
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      // Pages to audit
      const pagesToCheck = [
        { path: '/', name: 'Home' },
        { path: '/docs', name: 'Documentation' }
      ];

      for (const pageInfo of pagesToCheck) {
        await this.auditPage(browser, baseUrl + pageInfo.path, pageInfo.name);
      }

      // Generate report
      await this.generateReport();
      
    } catch (error) {
      console.error(`${colors.red}Audit failed: ${error.message}${colors.reset}`);
    } finally {
      await browser.close();
    }
  }

  async auditPage(browser, url, pageName) {
    console.log(`${colors.blue}📄 Auditing ${pageName} (${url})...${colors.reset}`);
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Track console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        this.results.errors.push({
          page: pageName,
          url: url,
          type: 'Console Error',
          message: msg.text(),
          location: msg.location()
        });
      } else if (msg.type() === 'warning') {
        this.results.warnings.push({
          page: pageName,
          url: url,
          type: 'Console Warning',
          message: msg.text()
        });
      }
    });

    // Track page errors
    page.on('pageerror', error => {
      this.results.errors.push({
        page: pageName,
        url: url,
        type: 'Page Error',
        message: error.message,
        stack: error.stack
      });
    });

    // Track network failures
    page.on('requestfailed', request => {
      this.results.networkFailures.push({
        page: pageName,
        url: url,
        failedUrl: request.url(),
        method: request.method(),
        failure: request.failure()
      });
    });

    // Track responses for broken resources
    page.on('response', response => {
      if (response.status() >= 400) {
        const resourceUrl = response.url();
        const resourceType = response.request().resourceType();
        
        if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'script') {
          this.results.missingAssets.push({
            page: pageName,
            url: url,
            assetUrl: resourceUrl,
            status: response.status(),
            type: resourceType
          });
        }
      }
    });

    try {
      // Navigate to page
      const response = await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Check main page response
      if (!response.ok()) {
        this.results.errors.push({
          page: pageName,
          url: url,
          type: 'Page Load Error',
          status: response.status(),
          statusText: response.statusText()
        });
      }

      // Wait a bit for any async operations
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check for broken internal links
      const brokenLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href]'));
        const broken = [];
        
        links.forEach(link => {
          const href = link.getAttribute('href');
          // Check for common broken link patterns
          if (href === '#' || href === 'javascript:void(0)' || href === '') {
            broken.push({
              text: link.textContent.trim(),
              href: href,
              issue: 'Empty or placeholder link'
            });
          }
        });
        
        return broken;
      });

      if (brokenLinks.length > 0) {
        brokenLinks.forEach(link => {
          this.results.brokenLinks.push({
            page: pageName,
            url: url,
            ...link
          });
        });
      }

      // Basic accessibility checks
      const accessibilityIssues = await page.evaluate(() => {
        const issues = [];
        
        // Check for missing alt text on images
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
        if (imagesWithoutAlt.length > 0) {
          issues.push({
            type: 'Missing Alt Text',
            count: imagesWithoutAlt.length,
            elements: Array.from(imagesWithoutAlt).slice(0, 5).map(img => ({
              src: img.src,
              className: img.className
            }))
          });
        }

        // Check for buttons without accessible text
        const buttons = document.querySelectorAll('button');
        const buttonsWithoutText = Array.from(buttons).filter(btn => 
          !btn.textContent.trim() && !btn.getAttribute('aria-label')
        );
        
        if (buttonsWithoutText.length > 0) {
          issues.push({
            type: 'Buttons without accessible text',
            count: buttonsWithoutText.length
          });
        }

        // Check for missing page title
        if (!document.title) {
          issues.push({
            type: 'Missing page title'
          });
        }

        return issues;
      });

      if (accessibilityIssues.length > 0) {
        accessibilityIssues.forEach(issue => {
          this.results.accessibilityIssues.push({
            page: pageName,
            url: url,
            ...issue
          });
        });
      }

      // Capture performance metrics
      const metrics = await page.metrics();
      const performanceTiming = await page.evaluate(() => 
        JSON.stringify(window.performance.timing)
      );
      
      this.results.performanceMetrics[pageName] = {
        url: url,
        metrics: metrics,
        timing: JSON.parse(performanceTiming)
      };

      // Check for mixed content
      const hasMixedContent = await page.evaluate(() => {
        const securePageWithInsecureResources = 
          window.location.protocol === 'https:' &&
          Array.from(document.querySelectorAll('img, script, link, iframe')).some(el => {
            const src = el.src || el.href;
            return src && src.startsWith('http:');
          });
        return securePageWithInsecureResources;
      });

      if (hasMixedContent) {
        this.results.warnings.push({
          page: pageName,
          url: url,
          type: 'Mixed Content',
          message: 'Page served over HTTPS contains HTTP resources'
        });
      }

    } catch (error) {
      this.results.errors.push({
        page: pageName,
        url: url,
        type: 'Navigation Error',
        message: error.message
      });
    } finally {
      await page.close();
    }
  }

  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.blue}📊 AUDIT REPORT${colors.reset}`);
    console.log('='.repeat(60) + '\n');

    // Errors
    if (this.results.errors.length > 0) {
      console.log(`${colors.red}❌ ERRORS (${this.results.errors.length})${colors.reset}`);
      this.results.errors.forEach((error, index) => {
        console.log(`\n${index + 1}. [${error.page}] ${error.type}`);
        console.log(`   URL: ${error.url}`);
        console.log(`   Message: ${error.message}`);
        if (error.location) {
          console.log(`   Location: ${error.location.url}:${error.location.lineNumber}`);
        }
      });
      console.log();
    } else {
      console.log(`${colors.green}✅ No errors found!${colors.reset}\n`);
    }

    // Warnings
    if (this.results.warnings.length > 0) {
      console.log(`${colors.yellow}⚠️  WARNINGS (${this.results.warnings.length})${colors.reset}`);
      this.results.warnings.forEach((warning, index) => {
        console.log(`\n${index + 1}. [${warning.page}] ${warning.type}`);
        console.log(`   Message: ${warning.message}`);
      });
      console.log();
    }

    // Network Failures
    if (this.results.networkFailures.length > 0) {
      console.log(`${colors.red}🔌 NETWORK FAILURES (${this.results.networkFailures.length})${colors.reset}`);
      this.results.networkFailures.forEach((failure, index) => {
        console.log(`\n${index + 1}. [${failure.page}] ${failure.method} ${failure.failedUrl}`);
        console.log(`   Reason: ${failure.failure.errorText}`);
      });
      console.log();
    }

    // Missing Assets
    if (this.results.missingAssets.length > 0) {
      console.log(`${colors.red}🖼️  MISSING ASSETS (${this.results.missingAssets.length})${colors.reset}`);
      this.results.missingAssets.forEach((asset, index) => {
        console.log(`\n${index + 1}. [${asset.page}] ${asset.type}`);
        console.log(`   URL: ${asset.assetUrl}`);
        console.log(`   Status: ${asset.status}`);
      });
      console.log();
    }

    // Broken Links
    if (this.results.brokenLinks.length > 0) {
      console.log(`${colors.yellow}🔗 PROBLEMATIC LINKS (${this.results.brokenLinks.length})${colors.reset}`);
      this.results.brokenLinks.forEach((link, index) => {
        console.log(`\n${index + 1}. [${link.page}] "${link.text}"`);
        console.log(`   href: ${link.href}`);
        console.log(`   Issue: ${link.issue}`);
      });
      console.log();
    }

    // Accessibility Issues
    if (this.results.accessibilityIssues.length > 0) {
      console.log(`${colors.yellow}♿ ACCESSIBILITY ISSUES${colors.reset}`);
      this.results.accessibilityIssues.forEach((issue, index) => {
        console.log(`\n${index + 1}. [${issue.page}] ${issue.type}`);
        if (issue.count) {
          console.log(`   Count: ${issue.count}`);
        }
        if (issue.elements) {
          console.log(`   Sample elements:`);
          issue.elements.forEach(el => {
            console.log(`   - ${el.src || el.className}`);
          });
        }
      });
      console.log();
    }

    // Summary
    console.log('='.repeat(60));
    console.log(`${colors.blue}📈 SUMMARY${colors.reset}`);
    console.log(`Errors: ${this.results.errors.length}`);
    console.log(`Warnings: ${this.results.warnings.length}`);
    console.log(`Network Failures: ${this.results.networkFailures.length}`);
    console.log(`Missing Assets: ${this.results.missingAssets.length}`);
    console.log(`Broken Links: ${this.results.brokenLinks.length}`);
    console.log(`Accessibility Issues: ${this.results.accessibilityIssues.length}`);
    console.log('='.repeat(60));

    // Save detailed report to file
    const reportPath = path.join(__dirname, `audit-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n${colors.green}📄 Detailed report saved to: ${reportPath}${colors.reset}`);
  }
}

// Run the audit
const auditor = new SiteAuditor();
auditor.audit().catch(console.error);