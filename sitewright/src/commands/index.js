#!/usr/bin/env node
import { program } from 'commander';
import { exec, spawn } from 'child_process';

import fs from 'fs';

program.command('init')
    .action((options) => {
        const templateUrl = new URL('./../template/', import.meta.url);
        console.log(`Copying ${templateUrl} to ${process.cwd()}`);
        fs.cp(templateUrl, process.cwd(), {recursive:true}, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('We\'re ready for the next step. :)')
            }
        });
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