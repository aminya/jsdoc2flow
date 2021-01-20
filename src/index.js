'use strict';

const fs = require('fs');
const espree = require('espree');
const _ = require('lodash');
const {createContainer, Lifetime, asValue} = require('awilix');

const visitorKeys = require('./visitor_keys.js');

class Converter {
    constructor(options = {}) {
        this.espreeOptions = {
            attachComment: true,
            ecmaVersion: options.ecmaVersion || 2019,
            sourceType: options.sourceType || "module"
        };

        this.container = this._createContainer(options);
    }

    convertFile(inputFilePath, outputFilePath) {
        const code = fs.readFileSync(inputFilePath).toString();
        const modifiedCode = this.convertSourceCode(code);
        fs.writeFileSync(outputFilePath, modifiedCode);

        // Retain the same permissions
        const fstat = fs.lstatSync(inputFilePath);
        fs.chmodSync(outputFilePath, fstat.mode);
    }

    convertSourceCode(code) {
        // Check to see if this code is being used as a script.
        // i.e. first line having something like `#!/usr/bin/env node`
        //
        // If it is, strip it out before trying to parse it.
        const regExp = /^(#![^\n]+\n)/;
        const matches = code.match(regExp);
        if (matches) {
            code = code.replace(regExp, '');
        }

        const ast = espree.parse(code, this.espreeOptions);

        const scope = this.container.createScope();
        scope.register({ sourceCode: asValue(code) });
        const visitor = scope.cradle.visitor;

        let fixes = [];
        this._traverseAST(ast, n => fixes = _.concat(fixes, visitor.visit(n)));

        let modifiedCode = this._applyFixes(code, fixes);
        if (matches) {
            // Put back the first line if it was stripped out before.
            modifiedCode = `${matches[1]}${modifiedCode}`;
        }
        return modifiedCode;
    }

    _traverseAST(ast, visit) {
        const stack = [ast];

        while (stack.length) {
            const node = stack.pop();
            if (visit) {
                visit(node);
            }

            const keys = visitorKeys[node.type];
            for (const key of keys) {
                const prop = node[key];
                if (Array.isArray(prop)) {
                    for (let i = prop.length - 1; i >= 0; i--) {
                        if (prop[i]) {
                            stack.push(prop[i]);
                        }
                    }
                }
                else if (prop) {
                    stack.push(prop);
                }
            }
        }
    }

    _applyFixes(code, fixes) {
        let modifiedCode = code;
        let offset = 0;

        // Sort fixes by start location
        fixes.sort((a, b) => a.start - b.start);

        for (const entry of fixes) {
            const before = modifiedCode.substring(0, entry.start + offset);
            const after = modifiedCode.substring(entry.start + offset);
            modifiedCode = before + entry.addition + after;
            offset += entry.addition.length;
        }

        return modifiedCode;
    }

    _createContainer(options) {
        const container = createContainer();
        container.register({ useFlowCommentSyntax: asValue(options.flowCommentSyntax || true) });
        container.loadModules([
            './flow_annotation.js',
            './fixers/*.js',
            ['./visitor.js', Lifetime.SCOPED]
        ], {
            registrationOptions: {
                lifetime: Lifetime.SINGLETON
            },
            cwd: __dirname,
            formatName: 'camelCase'
        });
        return container;
    }
}
module.exports = Converter;
