import fs from 'fs';

export function getSitemap() {

    const domain = process.env.domain;

    // TODO: Figure out how to do top level async
    const data = fs.readFileSync(`${process.cwd()}/projects/${process.env.projectname}.json`, {encoding: 'utf-8'});

    const sitemap = JSON.parse(data);
    sitemap.urlSpecs.forEach(urlSpec => {
        urlSpec.relativeUrl = urlSpec.url.replace(domain, '');
        urlSpec.name = `L${urlSpec.depth} > ${urlSpec.relativeUrl}`;
    });

    return sitemap;

};