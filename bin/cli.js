#!/usr/bin/env node

/* eslint-disable no-console */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const packageJson = require('../package.json');

program
    .version(packageJson.version)
    .option('-f, --file <file>', 'The file to convert and output to stdout')
    .option('-i, --input-directory <dir>', 'Source directory for original files')
    .option('-o, --output-directory <dir>', 'Destination directory for converted files')
    .parse(process.argv);

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
            if (entryInfo.isDirectory()) {
                stack.push(entryPath);
            }
            else {
                const newPath = path.join(program.outputDirectory,
                    entryPath.replace(resolvedInputDir, ''));
                fs.mkdirsSync(path.parse(newPath).dir);
                converter.convertFile(entryPath, newPath);
            }
        }
    }
}
else {
    program.outputHelp();
}
