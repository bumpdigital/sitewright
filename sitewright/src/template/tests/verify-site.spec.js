import { getSitemap, createValidator, test } from 'sitewright';

const sitemap = getSitemap();

test.describe(sitemap.domain, () => {
    for (let urlSpec of sitemap.urlSpecs) {
        test(urlSpec.name, async ({page}) => {
            const validate = await createValidator();
            await validate(page, urlSpec);
        });
    }
});
