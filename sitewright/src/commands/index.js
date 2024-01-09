#!/usr/bin/env node
import { program } from 'commander';
import { exec, spawn } from 'child_process';

import fs from 'fs';
import path from 'path';
import { transformSitemap } from './sitemaps.js';

// TODO: Validate root domain when no sitemap
// TODO: Maybe not uncritically overwrite stuff
// TODO: Validate more stuff

async function copyAll() {
    const templateUrl = new URL('./../template/', import.meta.url);
    return new Promise((resolve, reject) => 
        fs.cp(templateUrl, process.cwd(), {recursive:true}, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve();
            }
        })
    );
}

async function setup(options, isDefault) {
    let sitemap = null;
    if (options.sitemap) {
        sitemap = await transformSitemap(options.sitemap);
        if (options.name) {
            sitemap.projectName = options.name;
        }
    } else {
        const rootUrl = new URL(options.root);
        sitemap = {
            projectName: options.name,
            domain: rootUrl.origin + '/',
            urls: []
        };
    }

    console.log(`initializing project ${sitemap.projectName} with options`, options);

    const projectName = sitemap.projectName;

    const projectsPath = path.join(process.cwd(), 'projects');
    if (!fs.existsSync(projectsPath)) {
        fs.mkdirSync(projectsPath);
    }

    fs.writeFileSync(path.join(process.cwd(), `./projects/${projectName}.json`), JSON.stringify(sitemap, null, '  '));

    const scriptUrl = new URL('./../project-template/demo.js', import.meta.url);
    const scriptContents = fs.readFileSync(scriptUrl, { encoding: 'utf-8' });
    fs.writeFileSync(path.join(process.cwd(), `./projects/${projectName}.js`), scriptContents);

    const envFile = `projectname=${projectName}\ndomain=${sitemap.domain || 'https://localhost'}\nwhitelist=${options.whitelist || ''}`;
    fs.writeFileSync(path.join(process.cwd(), `${isDefault ? '' : projectName}.env`), envFile);
}

program.command('init')
    .option('-n, --name <string>', 'Default project name')
    .option('-r, --root <url>', 'Full URL to the root of the site')
    .option('-s, --sitemap <url>', 'Full URL to a sitemap')
    .option('-w, --whitelist <string>', 'Comma separated list of domains to allow JS from')
    .action(async (options) => {

        if (!options.name && !options.sitemap) {
            console.error('Provide either a project name or a sitemap URL');
            return;
        }

        await copyAll();
        await setup(options, true);
    });

program.command('add')
    .option('-n, --name <string>', 'Project name')
    .option('-r, --root <url>', 'Full URL to the root of the site')
    .option('-s, --sitemap <url>', 'Full URL to a sitemap')
    .option('-w, --whitelist <string>', 'Comma separated list of domains to allow JS from')
    .action(async (options) => {
        if (!options.name && !options.sitemap) {
            console.error('Provide either a project name or a sitemap URL');
            return;
        }

        await setup(options, false);
    });

program.command('test')
    .option('-l, --level <number>', 'how deep to go', 0)
    .option('-r, --retries <number>', 'how many retries to do', 3)
    .option('-w, --workers <number>', 'how many workers to use', 8)
    .action((options) => {
        let sp = spawn('npx', ['playwright', 'test', '-g', 'L' + options.level, '--retries', options.retries, '--workers', options.workers], {
            stdio: 'inherit',
            shell: true
        });
        sp.on('error', (err) => {
            console.error(`failed to spawn child process: ${err.message}`);
            throw(err);
        })
    });

program.parse();