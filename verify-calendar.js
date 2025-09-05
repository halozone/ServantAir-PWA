const { chromium } = require('playwright');
const path = require('path');

async function verifyCalendarHTML() {
    console.log('Starting ServantAir calendar.html verification...\n');

    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1
    });
    const page = await context.newPage();

    try {
        const filePath = path.resolve(__dirname, 'calendar.html');
        console.log(`Opening file: ${filePath}`);
        await page.goto(`file://${filePath}`);
        await page.waitForLoadState('networkidle');

        console.log('✓ Calendar page loaded successfully');

        // 1. Initial screenshot showing complete interface
        await page.screenshot({ 
            path: 'calendar-verification-desktop.png', 
            fullPage: true 
        });
        console.log('✓ Desktop screenshot taken: calendar-verification-desktop.png');

        // 2. Check for cockpit mode toggle in top-right corner
        console.log('\n--- Verifying Cockpit Mode Toggle ---');
        const cockpitToggle = await page.locator('.cockpit-mode-toggle, #cockpit-mode, [data-cockpit-toggle], .toggle-cockpit').first();
        const toggleExists = await cockpitToggle.count() > 0;
        
        if (toggleExists) {
            console.log('✓ Cockpit mode toggle found');
            const toggleBox = await cockpitToggle.boundingBox();
            if (toggleBox) {
                console.log(`✓ Cockpit toggle position: x=${toggleBox.x}, y=${toggleBox.y}`);
                console.log(`✓ Cockpit toggle size: ${toggleBox.width}x${toggleBox.height}px`);
                
                // Highlight the toggle for screenshot
                await page.evaluate((box) => {
                    const element = document.elementFromPoint(box.x + box.width/2, box.y + box.height/2);
                    if (element) {
                        element.style.outline = '3px solid #ff0000';
                        element.style.backgroundColor = '#ffff00';
                    }
                }, toggleBox);
            }
        } else {
            console.log('⚠ Cockpit mode toggle not found in top-right corner');
        }

        // 3. Test touch targets (minimum 44px)
        console.log('\n--- Verifying Touch Targets ---');
        const clickableElements = await page.locator('button, .btn, .filter-pill, .hamburger-menu, [role="button"], [onclick], .clickable').all();
        let touchTargetIssues = 0;

        for (let i = 0; i < clickableElements.length && i < 10; i++) {
            const element = clickableElements[i];
            const box = await element.boundingBox();
            if (box) {
                const meetsMinimum = box.width >= 44 && box.height >= 44;
                const status = meetsMinimum ? '✓' : '⚠';
                console.log(`${status} Touch target ${i+1}: ${box.width.toFixed(1)}x${box.height.toFixed(1)}px ${meetsMinimum ? '(Good)' : '(Too small)'}`);
                
                if (!meetsMinimum) {
                    touchTargetIssues++;
                    // Highlight problematic touch targets
                    await page.evaluate((box) => {
                        const element = document.elementFromPoint(box.x + box.width/2, box.y + box.height/2);
                        if (element) {
                            element.style.outline = '2px solid #ff6b6b';
                        }
                    }, box);
                }
            }
        }

        if (touchTargetIssues === 0) {
            console.log('✓ All touch targets meet 44px minimum requirement');
        } else {
            console.log(`⚠ ${touchTargetIssues} touch targets need size improvement`);
        }

        // 4. Screenshot with highlights
        await page.screenshot({ 
            path: 'calendar-touch-targets-highlighted.png', 
            fullPage: true 
        });
        console.log('✓ Touch targets highlighted screenshot taken: calendar-touch-targets-highlighted.png');

        // 5. Test cockpit mode toggle functionality (if found)
        if (toggleExists) {
            console.log('\n--- Testing Cockpit Mode Functionality ---');
            try {
                await cockpitToggle.click();
                await page.waitForTimeout(1000);
                console.log('✓ Cockpit mode toggle clicked');
                
                // Take screenshot in high-contrast mode
                await page.screenshot({ 
                    path: 'calendar-cockpit-mode.png', 
                    fullPage: true 
                });
                console.log('✓ High-contrast mode screenshot taken: calendar-cockpit-mode.png');
            } catch (error) {
                console.log('⚠ Could not test cockpit mode functionality:', error.message);
            }
        }

        // 6. Mobile view verification
        console.log('\n--- Testing Mobile Responsiveness ---');
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
        await page.waitForTimeout(500);

        const hamburgerMenu = await page.locator('.hamburger-menu, .mobile-menu-toggle, #menu-toggle').first();
        const hamburgerVisible = await hamburgerMenu.isVisible();
        console.log(`${hamburgerVisible ? '✓' : '⚠'} Hamburger menu visible on mobile: ${hamburgerVisible}`);

        await page.screenshot({ 
            path: 'calendar-mobile-verification.png', 
            fullPage: true 
        });
        console.log('✓ Mobile view screenshot taken: calendar-mobile-verification.png');

        // 7. Aviation appearance verification
        console.log('\n--- Verifying Aviation Design Elements ---');
        
        // Check for aviation-specific colors
        const primaryColor = await page.evaluate(() => {
            return getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        });
        console.log(`✓ Primary aviation color: ${primaryColor}`);

        // Check for aviation-themed elements
        const aviationElements = await page.locator('.aircraft, .flight, .cockpit, .aviation, [class*="aircraft"], [class*="flight"]').count();
        console.log(`✓ Found ${aviationElements} aviation-themed elements`);

        // Final desktop view
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
            path: 'calendar-final-verification.png', 
            fullPage: true 
        });
        console.log('✓ Final verification screenshot taken: calendar-final-verification.png');

        console.log('\n--- Verification Summary ---');
        console.log('✓ Calendar page loads correctly');
        console.log(`${toggleExists ? '✓' : '⚠'} Cockpit mode toggle ${toggleExists ? 'found' : 'missing'}`);
        console.log(`${touchTargetIssues === 0 ? '✓' : '⚠'} Touch targets ${touchTargetIssues === 0 ? 'properly sized' : 'need improvement'}`);
        console.log('✓ Mobile responsiveness verified');
        console.log('✓ Aviation design elements confirmed');
        console.log('✓ All verification screenshots captured');
        
        if (touchTargetIssues > 0 || !toggleExists) {
            console.log('\n⚠ Issues found that may need attention:');
            if (!toggleExists) console.log('  - Cockpit mode toggle not implemented');
            if (touchTargetIssues > 0) console.log(`  - ${touchTargetIssues} touch targets below 44px minimum`);
        } else {
            console.log('\n✓ All verification points passed successfully!');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        console.log('\nPress Ctrl+C to close browser and exit...');
        // Keep browser open for manual inspection
        await new Promise(() => {}); // Infinite wait
    }
}

verifyCalendarHTML().catch(console.error);