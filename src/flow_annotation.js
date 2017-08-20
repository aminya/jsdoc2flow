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
            this.blockPre = '/*::';
            this.blockPost = '*/';
        }
        else {
            this.inlinePre = '';
            this.inlinePost = '';
            this.blockPre = '';
            this.blockPost = '';
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

    alias(start, indent, title, name, varType, properties, returnTag) {
        if (title === 'callback') {
            const returnType = returnTag ? determineVarType(returnTag.type) : 'void';
            const lines = [];
            const props = [];
            lines.push(`${indent}${this.blockPre}`);
            for (const property of properties) {
                const propType = determineVarType(property.type);
                props.push(`${property.name}: ${propType}`);
            }
            lines.push(`${indent}type ${name} = (${props.join(', ')}) => ${returnType};`);
            lines.push(`${indent}${this.blockPost}`);
            return {
                start: start,
                addition: lines.join('\n')
            };
        }
        else {
            const type = determineVarType(varType);
            if (type.toLowerCase() === 'object' && properties.length) {
                const lines = [];
                const propLines = [];
                lines.push(`${indent}${this.blockPre}`);
                lines.push(`${indent}type ${name} = {`);
                for (const property of properties) {
                    const propType = determineVarType(property.type);
                    propLines.push(`${indent}  ${property.name}: ${propType}`);
                }
                lines.push(propLines.join(',\n'));
                lines.push(`${indent}};`);
                lines.push(`${indent}${this.blockPost}`);
                return {
                    start: start,
                    addition: lines.join('\n')
                };
            }
            else {
                return {
                    start: start,
                    addition: [
                        `${indent}${this.blockPre}`,
                        `${indent}type ${name} = ${type};`,
                        `${indent}${this.blockPost}`
                    ].join('\n')
                };
            }
        }
    }
}
module.exports = FlowAnnotation;
