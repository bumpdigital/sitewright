import { extendTest, test } from './fixtures.js';
import { getSitemap } from './sitemaps.js';
import url from 'url'

async function createValidator() {
    const importUrl = url.pathToFileURL(`${process.cwd()}/projects/${process.env.projectname}.js`);
    const { validate } = await import(importUrl);
    return validate;
}

export {
    extendTest,
    test,
    getSitemap,
    createValidator
}