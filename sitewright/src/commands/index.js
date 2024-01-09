#!/usr/bin/env node
import { program } from 'commander';
import { exec, spawn } from 'child_process';

import fs from 'fs';
import path from 'path';
import { transformSitemap } from './sitemaps.js';

// TODO: Rewrite setup with the fsPromise API
// TODO: A command that updates screenshots (just test?)
// TODO: A command that re-runs previous failures and updates the snapshots (just test?)
// TODO: Validate root domain when no sitemap
// TODO: Maybe not uncritically overwrite stuff
// TODO: Validate more stuff
// TODO: More versatile building of test args array w/different options
// TODO: Generate URL-spec file from list of URLs
// TODO: Figure out why the .gitignore file isn't copied by fs.cp

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

    const envFile = `projectname=${projectName}\ndomain=${sitemap.domain || 'https://localhost'}\njswhitelist=${options.whitelist || ''}`;
    fs.writeFileSync(path.join(process.cwd(), `${isDefault ? '' : projectName}.env`), envFile);

    const manifestPath = path.join(process.cwd(), 'package.json');
    const manifestContents = fs.readFileSync(manifestPath, { encoding: 'utf-8' });
    const manifest = JSON.parse(manifestContents);
    manifest.type = 'module';
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, '  '));
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
    .option('-g, --grep <tring>', 'Custom grep. Will ignore --level.')
    .option('-l, --level <number>', 'How deep to go. Ignored when using --grep.', 0)
    .option('-r, --retries <number>', 'how many retries to do', 1)
    .option('-w, --workers <number>', 'how many workers to use', 8)
    .action((options) => {
        const command = ['playwright', 'test', '-g', options.grep || ( options.level ? `L[0-${options.level}]` : 'L0' ), '--retries', options.retries, '--workers', options.workers];
        console.log('executing command', command);
        let sp = spawn('npx', command, {
            stdio: 'inherit',
            shell: true
        });
        sp.on('error', (err) => {
            console.error(`failed to spawn child process: ${err.message}`);
            throw(err);
        })
    });

program.parse();