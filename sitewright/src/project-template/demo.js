export async function validate(page, { url, parts }) {
    await page.goto(url);
    await page.slowScroll();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.validateScreenshot(parts, 'snapshot.png');
}