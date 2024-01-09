
import { XMLParser } from 'fast-xml-parser';

export async function transformSitemap(url) {
    if (typeof(url) === 'string') {
        url = new URL(url);
    }
    
    const response = await fetch(url);
    const content = await response.text();

    const jobj = new XMLParser().parse(content);

    const urls = jobj.urlset.url.map(urlElement => {
        const url = new URL(urlElement.loc);
        const parts = url.pathname.substring(1).split('/').filter(x => x);
        return {
            url: url.href,
            parts: parts,
            depth: parts.length,
            length: url.href.length,
            mod: urlElement.lastmod
        }
    });

    const hostParts = url.host.split('.');
    const projectName = hostParts[hostParts.length - 2];

    return {
        projectName,
        domain: url.origin + '/',
        urlSpecs: urls.sort((a, b) => {
            a.depth < b.depth
            ? -1
            : a.depth > b.depth
            ? 1
            : a.length < b.length
            ? -1
            : a.length > b.length
            ? 1
            : 0
        })
    };
}
