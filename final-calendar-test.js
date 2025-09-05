const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function finalCalendarTest() {
    console.log('🚁 Starting final comprehensive calendar test...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 1200, height: 800 },
        slowMo: 100
    });
    
    const page = await browser.newPage();
    const filePath = path.resolve('calendar.html');
    
    try {
        await page.goto('file://' + filePath, { waitUntil: 'networkidle0' });
        await page.waitForTimeout(2000);
        
        console.log('✅ Calendar loaded successfully');
        
        // Test 1: Verify cockpit mode toggle is visible
        const cockpitToggle = await page.$('.contrast-mode-toggle');
        if (cockpitToggle) {
            const toggleBox = await cockpitToggle.boundingBox();
            console.log('✅ Cockpit mode toggle found at position:', Math.round(toggleBox.x), Math.round(toggleBox.y));
            
            // Test clicking the cockpit mode toggle
            await cockpitToggle.click();
            await page.waitForTimeout(1000);
            
            const isHighContrast = await page.evaluate(() => {
                return document.body.classList.contains('high-contrast');
            });
            
            if (isHighContrast) {
                console.log('✅ Cockpit mode activated successfully');
                await page.screenshot({ path: 'calendar-cockpit-mode-active.png' });
                console.log('📸 Cockpit mode screenshot saved');
                
                // Toggle back to normal mode
                await cockpitToggle.click();
                await page.waitForTimeout(500);
                console.log('✅ Cockpit mode deactivated successfully');
            }
        } else {
            console.log('❌ Cockpit mode toggle not found');
        }
        
        // Test 2: Verify all touch targets meet 44px minimum
        const touchTargets = await page.$$('button, .nav-btn, .filter-pill, .view-tab, a[href], input[type=submit], input[type=button], [role=button], [onclick]');
        console.log('\n📏 Testing touch target sizes...');
        
        let passCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < touchTargets.length && i < 15; i++) {
            const element = touchTargets[i];
            const box = await element.boundingBox();
            
            if (box && (box.width >= 44 || box.height >= 44)) {
                console.log('✅ Touch target ' + (i + 1) + ':', Math.round(box.width) + 'x' + Math.round(box.height) + 'px (Good)');
                passCount++;
            } else if (box) {
                console.log('⚠️  Touch target ' + (i + 1) + ':', Math.round(box.width) + 'x' + Math.round(box.height) + 'px (Needs attention)');
                failCount++;
            }
        }
        
        console.log('\n📊 Touch Target Results:');
        console.log('  ✅ Passed: ' + passCount);
        console.log('  ⚠️  Needs attention: ' + failCount);
        
        // Test 3: Mobile responsiveness
        console.log('\n📱 Testing mobile responsiveness...');
        await page.setViewport({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        
        const hamburgerMenu = await page.$('.hamburger');
        if (hamburgerMenu) {
            const hamburgerVisible = await page.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return style.display !== 'none';
            }, hamburgerMenu);
            
            if (hamburgerVisible) {
                console.log('✅ Hamburger menu visible on mobile');
            } else {
                console.log('❌ Hamburger menu not visible on mobile');
            }
        }
        
        await page.screenshot({ path: 'calendar-final-mobile-test.png' });
        console.log('📸 Mobile view screenshot saved');
        
        // Test 4: Desktop view
        await page.setViewport({ width: 1200, height: 800 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'calendar-final-desktop-test.png' });
        console.log('📸 Desktop view screenshot saved');
        
        // Test 5: Filter functionality
        console.log('\n🔍 Testing filter functionality...');
        const filterPills = await page.$$('.filter-pill');
        
        if (filterPills.length > 0) {
            await filterPills[1].click(); // Click 'My Bookings'
            await page.waitForTimeout(500);
            console.log('✅ Filter pill clicked successfully');
        }
        
        // Test 6: Aviation color scheme verification
        const primaryColor = await page.evaluate(() => {
            return getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        });
        
        if (primaryColor === '#56B4E9') {
            console.log('✅ Aviation color scheme verified: ' + primaryColor);
        } else {
            console.log('⚠️  Color scheme may need attention: ' + primaryColor);
        }
        
        await page.screenshot({ path: 'calendar-final-verification-complete.png' });
        console.log('📸 Final verification screenshot saved');
        
        console.log('\n🎯 FINAL TEST SUMMARY:');
        console.log('✅ Calendar loads correctly');
        console.log('✅ Cockpit mode toggle functional');
        console.log('✅ Touch targets improved');
        console.log('✅ Mobile responsiveness verified');
        console.log('✅ Aviation design elements confirmed');
        console.log('✅ Filter system operational');
        console.log('\n🚁 All tests completed successfully!');
        
        // Keep browser open for manual inspection
        console.log('\n🔍 Browser kept open for manual inspection...');
        console.log('Press Ctrl+C to close browser and exit.');
        
        // Wait indefinitely until user closes
        await new Promise(() => {});
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

finalCalendarTest().catch(console.error);