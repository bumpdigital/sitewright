import { test as base, expect } from '@playwright/test';
import { slowScroll } from './slowscroll.js';

const maxDiff = process.env.maxdiff || .03;

export function extendTest(base) {
    return base.extend({
        page: async ({browser}, use) => {
            const context = await browser.newContext();
            const page = await context.newPage();
            page.validateScreenshot = validateScreenshot;
            page.slowScroll = async function() {
                await slowScroll(this);
            }
    
            await mockExternalJS(page);
    
            await use(page);
        }
    });
}

export const test = base.extend({
    page: async ({browser}, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        page.validateScreenshot = validateScreenshot;
        page.slowScroll = async function() {
            await slowScroll(this);
        }

        await mockExternalJS(page);

        await use(page);
    }
});

async function validateScreenshot(folders, screenshotName) {
    const parts = [process.env.projectname, ...folders];
    await expect(this).toHaveScreenshot(
        [...parts, screenshotName],
        {
            animations: "disabled", // allow | disabled
            fullPage: true,
            timeout: 30000,
            maxDiffPixelRatio: maxDiff,
            mask: [
                await this.locator('iframe')
            ]
        });
}

async function mockExternalJS(page) {
    const domains = process.env.jswhitelist.split(',');
    // TODO: There is probably a regex or glob that will work
    // but for now the hunt has always came up short. GTM gets through.
    // `(/^http(?:s)?:\/\/(?!(?:\w+.)?(?:oetkercollections.com)).*(?:js).*/g)`  
    await page.route("**/*", async (route) => {
        const url = route.request().url();
        if (url.indexOf('.js') > -1) {
            for (let domain of domains) {
                if (url.indexOf(domain) > -1) {
                    await route.continue();
                    return;
                }
            }

            await route.fulfill({
                status: 200,
                contentType: 'text/javascript',
                body: `console.log("mocked route ${url}");`
            });
        } else {
            await route.continue();
        }
    });
}
