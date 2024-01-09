import { test } from '../sitewright/fixtures';
import { sitemap } from './sitemaps';
const { validate } = require(`${process.cwd()}/projects/${process.env.projectname}`);

export {
    test,
    sitemap,
    validate
}