#!/usr/bin/env node

/* eslint-disable no-console */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const packageJson = require('../package.json');

function collect(val, list) {
    list.push(val);
    return list;
}

program
    .version(packageJson.version)
    .option('-f, --file <file>', 'The file to convert and output to stdout')
    .option('-i, --input-directory <dir>', 'Source directory for original files')
    .option('-o, --output-directory <dir>', 'Destination directory for converted files')
    .option('--ext [ext]', 'File extension to convert. Can specify multiple extensions. Defaults to \'js\' only.', collect, [])
    .option('-v, --verbose', 'Verbose output')
    .parse(process.argv);

if (program.ext.length === 0) {
    program.ext.push('.js');
}
program.ext = program.ext.map(e => e.startsWith('.') ? e : '.' + e);

let log = () => {};
if (program.verbose) {
    log = console.log;
}

const Converter = require('../src');
const converter = new Converter();


if (program.file) {
    const code = fs.readFileSync(program.file).toString();
    const modifiedCode = converter.convertSourceCode(code);
    console.log(modifiedCode);
}
else if (program.inputDirectory && program.outputDirectory) {
    const resolvedInputDir = path.resolve(program.inputDirectory);
    const resolvedOutputDir = path.resolve(program.outputDirectory);

    fs.mkdirsSync(resolvedOutputDir);
    const stack = [resolvedInputDir];
    while (stack.length) {
        const basePath = stack.pop();
        const entries = fs.readdirSync(basePath);
        for (const entry of entries) {
            const entryPath = path.join(basePath, entry);
            const entryInfo = fs.lstatSync(entryPath);
            const entryPathObj = path.parse(entryPath);
            if (entryInfo.isDirectory()) {
                stack.push(entryPath);
            }
            else if (program.ext.includes(entryPathObj.ext)) {
                const newPath = path.join(program.outputDirectory,
                    entryPath.replace(resolvedInputDir, ''));
                fs.mkdirsSync(path.parse(newPath).dir);
                log(`Convert ${entryPath} to ${newPath}`);
                converter.convertFile(entryPath, newPath);
            }
        }
    }
}
else {
    program.outputHelp();
}
