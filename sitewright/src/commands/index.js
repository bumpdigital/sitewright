#!/usr/bin/env node
import { program } from 'commander';
import { exec, spawn } from 'child_process';

import fs from 'fs';
import path from 'path';

program.command('init')
    .argument('<projectname>', 'Default project name')
    .option('-r, --root <url>', 'Full URL to the root of the site')
    .option('-s, --sitemap <url>', 'Full URL to a sitemap')
    .option('-w, --whitelist <string>', 'Comma separated list of domains to allow JS from')
    .action((projectName, options) => {
        const templateUrl = new URL('./../template/', import.meta.url);

        console.log(`initializing project ${projectName} with options`, options);
        
        function copyAll() {
            fs.cp(templateUrl, process.cwd(), {recursive:true}, (err) => {
                if (err) {
                    console.error(err.message);
                } else {
                    setup()
                }
            });
        }

        function setup() {
            const envFile = `projectname=${projectName}\ndomain=${options.root}\nwhitelist=${options.whitelist}`;
            fs.writeFileSync(path.join(process.cwd(), '.env'), envFile);

            fs.renameSync(path.join(process.cwd(), './projects/demo.js'), path.join(process.cwd(), `./projects/${projectName}.js`));
            fs.renameSync(path.join(process.cwd(), './projects/demo.json'), path.join(process.cwd(), `./projects/${projectName}.json`));

            fs.writeFileSync(path.join(process.cwd(), `./projects/${projectName}.json`), JSON.stringify([]));
        }

        copyAll();
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