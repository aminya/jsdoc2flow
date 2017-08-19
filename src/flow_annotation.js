'use strict';

function determineVarType(varType) {
    if (varType.type === 'NameExpression') {
        return varType.name;
    }
    else if (varType.type === 'TypeApplication') {
        if (varType.expression.type === 'NameExpression' &&
            varType.expression.name === 'Array' &&
            varType.applications.length === 1 &&
            varType.applications[0].type === 'NameExpression') {
            return `Array<${varType.applications[0].name}>`;
        }
    }
    else if (varType.type === 'OptionalType' || varType.type === 'NullableType') {
        if (varType.expression.type === 'NameExpression') {
            return `?${varType.expression.name}`;
        }
    }
    else if (varType.type === 'AllLiteral') {
        return 'any';
    }
    else if (varType.type === 'UnionType') {
        const types = [];
        let allNameExpressions = true;
        for (const element of varType.elements) {
            if (element.type !== 'NameExpression') {
                allNameExpressions = false;
            }
            types.push(element.name);
        }
        if (!allNameExpressions) {
            throw new Error('union type not all NameExpressions');
        }
        return types.join(' | ');
    }
    throw new Error(`unknown '${varType.type}' type - ${JSON.stringify(varType)}`);
}

class FlowAnnotation {
    constructor({ useFlowCommentSyntax }) {
        if (useFlowCommentSyntax) {
            this.inlinePre = ' /*';
            this.inlinePost = ' */';
        }
        else {
            this.inlinePre = '';
            this.inlinePost = '';
        }
    }

    inline(start, varType, isRestParam) {
        let addition = '';
        if (varType) {
            let type = determineVarType(varType);
            if (isRestParam) {
                type = `Array<${type}>`;
            }
            addition = `${this.inlinePre}: ${type}${this.inlinePost}`;
        }
        return {
            start: start,
            addition: addition
        };
    }
}
module.exports = FlowAnnotation;
