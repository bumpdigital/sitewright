import { describe, it } from 'mocha';
import approvals from 'approvals';
import path from 'path';

import { transformSitemap } from '../../sitewright/src/commands/sitemaps.js';

/* tests */

describe('converting sitemaps', () => {

    it('can fetch one from the interwebz', async () => {
        const sitemap = await transformSitemap('https://www.sitemaps.org/sitemap.xml');

        sitemap.urls = sitemap.urls.filter((x, i) => i < 5);

        approvals.verifyAsJSON(path.join(process.cwd(),'test/sitemaps-approved'), 'sitemaps-org', sitemap);
    });

});