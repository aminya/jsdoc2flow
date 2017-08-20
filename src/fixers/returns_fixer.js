'use strict';

class ReturnsFixer {
    constructor({ flowAnnotation }) {
        this.flowAnnotation = flowAnnotation;
    }

    getFixes(tag, node, { code, comment }) {
        const fixes = [];

        // @returns always applies to things that come after it
        if (node.trailingComments && node.trailingComments.includes(comment)) {
            return fixes;
        }

        // @returns can only be applied to FunctionDeclaration, or a
        // FunctionExpression that might be embedded within a VariableDeclaration
        if (node.type !== 'FunctionDeclaration' &&
            node.type != 'VariableDeclaration' &&
            node.type != 'MethodDefinition' &&
            node.type != 'Property' &&
            node.type != 'ExpressionStatement') {
            return fixes;
        }

        let blockStatementNode = node.body;

        if (node.type === 'VariableDeclaration') {
            if (node.declarations.length !== 1) {
                return fixes;
            }

            const varInit = node.declarations[0].init;
            if (varInit.type !== 'FunctionExpression' &&
                varInit.type !== 'ArrowFunctionExpression') {
                return fixes;
            }

            blockStatementNode = varInit.body;
        }
        else if (node.type === 'MethodDefinition' || node.type === 'Property') {
            if (node.value.type !== 'FunctionExpression') {
                return fixes;
            }
            blockStatementNode = node.value.body;
        }
        else if (node.type === 'ExpressionStatement') {
            if (node.expression.type !== 'AssignmentExpression' ||
                node.expression.right.type !== 'FunctionExpression') {
                return fixes;
            }
            blockStatementNode = node.expression.right.body;
        }

        // Look back to try to find the ending bracket
        let endBracketIndex = -1;
        for (let i = blockStatementNode.start; i >= node.start; i--) {
            if (code[i] === ')') {
                endBracketIndex = i;
            }
        }

        // If there is no ending bracket, then just ignore and do nothing. This is
        // mainly for arrow functions, which can be declared without brackets.
        if (endBracketIndex < 0) {
            return fixes;
        }

        fixes.push(this.flowAnnotation.inline(endBracketIndex + 1, tag.type));
        return fixes;
    }
}
module.exports = ReturnsFixer;
