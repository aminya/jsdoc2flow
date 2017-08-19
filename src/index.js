'use strict';

const fs = require('fs');
const espree = require('espree');
const _ = require('lodash');
const {createContainer, Lifetime} = require('awilix');

const visitorKeys = require('./visitor_keys.js');

class Converter {
    constructor(options = {}) {
        this.espreeOptions = {
            attachComment: true
        };
        this.espreeOptions.ecmaVersion = options.ecmaVersion || 6;

        this.container = this._createContainer(options);
    }

    convertFile(inputFilePath, outputFilePath) {
        const code = fs.readFileSync(inputFilePath).toString();
        const modifiedCode = this.convertSourceCode(code);
        fs.writeFileSync(outputFilePath, modifiedCode);
    }

    convertSourceCode(code) {
        const ast = espree.parse(code, this.espreeOptions);

        const scope = this.container.createScope();
        scope.registerValue({ sourceCode: code });
        const visitor = scope.cradle.visitor;

        let fixes = [];
        this._traverseAST(ast, n => fixes = _.concat(fixes, visitor.visit(n)));

        const modifiedCode = this._applyFixes(code, fixes);
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
                        stack.push(prop[i]);
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
        container.registerValue({ useFlowCommentSyntax: options.flowCommentSyntax || true });
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
