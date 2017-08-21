'use strict';

const _ = require('lodash');

class ParamFixer {
    constructor({ flowAnnotation }) {
        this.flowAnnotation = flowAnnotation;
    }

    getFixes(tag, node, { comment, tags }) {
        const fixes = [];

        let tagName = tag.name;
        let params = node.params;

        // ObjectPattern requires special logic. The individual property names
        // won't be handled individually.
        if (tagName.includes('.')) {
            return fixes;
        }

        // @param always applies to things that come after it
        if (node.trailingComments && node.trailingComments.includes(comment)) {
            return fixes;
        }

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
                (node.expression.right.type !== 'FunctionExpression' &&
                 node.expression.right.type !== 'ArrowFunctionExpression')) {
                return fixes;
            }
            params = node.expression.right.params;
        }

        const idGroups = this._getIdentifiersFromTags(tags);
        let idGroup = idGroups[tagName];

        // Each param potentially needs further unwrapping. For example, you
        // can provide default values for a parameter. When that happens, the
        // param is first an AssignmentPattern and you have to unwrap it to get
        // to Identifier.
        for (const param of params) {
            const stack = [{ n: param, restParam: false }];
            const seenEntries = [];
            while (stack.length) {
                const entry = stack.pop();
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
                else if (n.type === 'ObjectPattern' && idGroup) {
                    // ObjectPattern is special and a bit more complicated

                    // Collect all the Identifiers within this ObjectPattern
                    const ids = this._getIdentifiersFromObjectPattern(n);

                    const diff = _.difference(ids, idGroup.ids);
                    if (diff.length === 0) {
                        // Found a match!
                        fixes.push(this.flowAnnotation.inlineObj(n.end, idGroup.children));
                        break;
                    }
                }
                else if (n.type === 'RestElement') {
                    stack.push({ n: n.argument, restParam: true });
                }
            }
        }

        return fixes;
    }

    _getIdentifiersFromObjectPattern(objPattern) {
        const ids = [];
        const stack = [objPattern];
        const visitedNodes = [];
        while (stack.length) {
            const node = stack.pop();
            const alreadyVisited = visitedNodes.some(visitedNode => _.isEqual(node, visitedNode));
            if (alreadyVisited) {
                continue;
            }
            visitedNodes.push(node);

            if (node.type === 'Identifier') {
                ids.push(node.name);
            }
            else if (node.type === 'AssignmentPattern') {
                stack.push(node.left);
            }
            else if (node.type === 'ObjectPattern') {
                for (const prop of node.properties) {
                    stack.push(prop.key);
                    stack.push(prop.value);
                }
            }
        }
        return ids;
    }

    _getIdentifiersFromTags(tags) {
        const groups = {};

        let groupName = null;
        for (const tag of tags) {
            if (!tag.type ||
                (tag.title !== 'param' &&
                 tag.title !== 'arg' &&
                 tag.title !== 'argument')) {
                continue;
            }

            if (groupName && tag.name.startsWith(groupName + '.')) {
                const nameParts = tag.name.split('.');
                const id = nameParts[nameParts.length - 1];
                groups[groupName].ids.push(id);
                groups[groupName].children.push(tag);
            }
            else if (tag.type.type === 'NameExpression' &&
                tag.type.name.toLowerCase() === 'object') {

                groups[tag.name] = {
                    ids: [],
                    children: []
                };
                groupName = tag.name;
            }
        }

        return groups;
    }
}
module.exports = ParamFixer;
