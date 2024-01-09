// Slow method to scroll entire page, but seems to make things less flaky
// Source: https://www.houseful.blog/posts/2023/fix-flaky-playwright-visual-regression-tests/
export async function slowScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            const distance = 100;
            let totalHeight = 0;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve(true);
                }
            }, 100);
        });
    });
};