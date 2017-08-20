'use strict';

const _ = require('lodash');

class ParamFixer {
    constructor({ flowAnnotation }) {
        this.flowAnnotation = flowAnnotation;
    }

    getFixes(tag, node) {
        const fixes = [];

        let tagName = tag.name;
        let params = node.params;

        // @param can only be applied to FunctionDeclaration, or a
        // FunctionExpression that might be embedded within a VariableDeclaration
        if (node.type !== 'FunctionDeclaration' &&
            node.type != 'VariableDeclaration' &&
            node.type != 'MethodDefinition' &&
            node.type != 'Property' &&
            node.type != 'ExpressionStatement') {
            return fixes;
        }

        if (node.type === 'VariableDeclaration') {
            if (node.declarations.length !== 1) {
                return fixes;
            }

            const varInit = node.declarations[0].init;
            if (varInit.type !== 'FunctionExpression' &&
                varInit.type !== 'ArrowFunctionExpression') {
                return fixes;
            }

            params = varInit.params;
        }
        else if (node.type === 'MethodDefinition' || node.type === 'Property') {
            if (node.value.type !== 'FunctionExpression') {
                return fixes;
            }
            params = node.value.params;
        }
        else if (node.type === 'ExpressionStatement') {
            if (node.expression.type !== 'AssignmentExpression' ||
                node.expression.right.type !== 'FunctionExpression' &&
                node.expression.right.type !== 'ArrowFunctionExpression') {
                return fixes;
            }
            params = node.expression.right.params;
        }

        for (const param of params) {
            const stack = [{ n: param, restParam: false }];
            const seenEntries = [];
            while (stack.length) {
                const entry  = stack.pop();
                const alreadySeen = seenEntries.some(seenEntry => _.isEqual(entry, seenEntry));
                if (alreadySeen) {
                    continue;
                }
                seenEntries.push(entry);

                const n = entry.n;

                if (n.type === 'Identifier') {
                    if (n.name === tagName) {
                        fixes.push(this.flowAnnotation.inline(n.end, tag.type, entry.restParam));
                    }
                }
                else if (n.type === 'AssignmentPattern') {
                    stack.push({ n: n.left, restParam: false });
                }
                else if (n.type === 'ObjectPattern') {
                    tagName = tagName.substring(tagName.indexOf('.') + 1);
                    for (const prop of n.properties) {
                        stack.push({ n: prop.key, restParam: false });
                        stack.push({ n: prop.value, restParam: false });
                    }
                }
                else if (n.type === 'RestElement') {
                    stack.push({ n: n.argument, restParam: true });
                }
            }
        }

        return fixes;
    }
}
module.exports = ParamFixer;
