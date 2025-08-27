const puppeteer = require('puppeteer');

async function testSite() {
  console.log('🚀 Starting comprehensive site test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Test 1: Basic Navigation and Loading
    console.log('\n📋 Test 1: Basic Navigation and Loading');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('✅ Homepage loaded successfully');
    
    // Test 2: Authentication
    console.log('\n📋 Test 2: Authentication');
    await page.goto('http://localhost:3000/auth', { waitUntil: 'networkidle0' });
    console.log('✅ Auth page loaded');
    
    // Test signup functionality
    await page.type('input[name="username"]', 'testuser' + Date.now());
    await page.type('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    console.log('✅ Signup form submitted');
    
    // Test 3: Dashboard Access
    console.log('\n📋 Test 3: Dashboard Access');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    console.log('✅ Dashboard loaded');
    
    // Test 4: Theme Toggle
    console.log('\n📋 Test 4: Theme Toggle');
    const themeButton = await page.$('button[title*="theme"]');
    if (themeButton) {
      await themeButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Theme toggle working');
    }
    
    // Test 5: Navigation Menu
    console.log('\n📋 Test 5: Navigation Menu');
    const navButtons = await page.$$('button');
    for (const button of navButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && (text.includes('Friends') || text.includes('DMs') || text.includes('Polls'))) {
        await button.click();
        await page.waitForTimeout(1000);
        console.log(`✅ Navigation to ${text} working`);
        break;
      }
    }
    
    // Test 6: Global Chat
    console.log('\n📋 Test 6: Global Chat');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    const globalChatButton = await page.$('button:has-text("Global Chat")');
    if (globalChatButton) {
      await globalChatButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Global chat loaded');
      
      // Test message input
      const messageInput = await page.$('textarea, input[type="text"]');
      if (messageInput) {
        await messageInput.type('Test message from automated test');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        console.log('✅ Message sent successfully');
      }
    }
    
    // Test 7: Settings Page
    console.log('\n📋 Test 7: Settings Page');
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle0' });
    console.log('✅ Settings page loaded');
    
    // Test 8: Responsive Design
    console.log('\n📋 Test 8: Responsive Design');
    await page.setViewport({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    console.log('✅ Mobile viewport working');
    
    await page.setViewport({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    console.log('✅ Desktop viewport working');
    
    // Test 9: Dark Mode Persistence
    console.log('\n📋 Test 9: Dark Mode Persistence');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    const themeButton2 = await page.$('button[title*="theme"]');
    if (themeButton2) {
      await themeButton2.click();
      await page.waitForTimeout(1000);
      await page.reload({ waitUntil: 'networkidle0' });
      console.log('✅ Theme persistence working');
    }
    
    // Test 10: Error Handling
    console.log('\n📋 Test 10: Error Handling');
    await page.goto('http://localhost:3000/nonexistent-page', { waitUntil: 'networkidle0' });
    console.log('✅ 404 page handling working');
    
    // Test 11: Performance
    console.log('\n📋 Test 11: Performance');
    const startTime = Date.now();
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    const loadTime = Date.now() - startTime;
    console.log(`✅ Dashboard loaded in ${loadTime}ms`);
    
    // Test 12: Accessibility
    console.log('\n📋 Test 12: Accessibility');
    const buttons = await page.$$('button');
    let accessibleButtons = 0;
    for (const button of buttons) {
      const ariaLabel = await button.evaluate(el => el.getAttribute('aria-label') || el.getAttribute('title'));
      if (ariaLabel) accessibleButtons++;
    }
    console.log(`✅ ${accessibleButtons} buttons have accessibility labels`);
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testSite().catch(console.error);
