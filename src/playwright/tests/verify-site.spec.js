import { test, sitemap, validate } from '../sitewright';

test.describe(sitemap.domain, () => {
    for (let urlSpec of sitemap.urlSpecs) {
        test(urlSpec.name, async ({page}) => {
            await validate(page, urlSpec);
        });
    }
});
