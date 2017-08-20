'use strict';

class TypeFixer {
    constructor({ flowAnnotation }) {
        this.flowAnnotation = flowAnnotation;
    }

    getFixes(tag, node) {
        const fixes = [];

        if (node.type != 'VariableDeclaration') {
            return fixes;
        }

        if (node.type === 'VariableDeclaration') {
            if (node.declarations.length !== 1) {
                return fixes;
            }

            const varID = node.declarations[0].id;
            fixes.push(this.flowAnnotation.inline(varID.end, tag.type));
        }

        return fixes;
    }
}
module.exports = TypeFixer;
