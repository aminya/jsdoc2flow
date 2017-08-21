'use strict';

function determineVarType(varType) {
    if (varType.type === 'NameExpression') {
        return varType.name;
    }
    else if (varType.type === 'TypeApplication') {
        if (varType.expression.type === 'NameExpression' &&
            varType.applications.every(a => a.type === 'NameExpression')) {
            const innerTypes = varType.applications.map(a => a.name).join(',');
            return `${varType.expression.name}<${innerTypes}>`;
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
    constructor({ useFlowCommentSyntax = true } = {}) {
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

    inlineObj(start, tags) {
        let addition = '';
        tags.sort((a, b) => {
            if (b.name > a.name) {
                return -1;
            }
            else if (a.name > b.name) {
                return 1;
            }
            return 0;
        });

        const result = this._transformTags(tags, 0);

        addition = `${this.inlinePre}: { ${result.type} }${this.inlinePost}`;
        return {
            start: start,
            addition: addition
        };
    }

    _transformTags(tags, start) {
        const objProps = [];
        let i = start;
        for (; i < tags.length; i++) {
            const tag = tags[i];

            const nameParts = tag.name.split('.');

            let type = determineVarType(tag.type);

            let name = nameParts[nameParts.length - 1];
            if (type.startsWith('?')) {
                name += '?';
            }

            if (type.toLowerCase().replace(/^\?/, '') === 'object') {
                if (i + 1 < tags.length && tags[i + 1].name.startsWith(tag.name)) {
                    const result = this._transformTags(tags, i + 1);
                    i = result.end + 1;
                    objProps.push(`${name}: { ${result.type} }`);
                }
                else {
                    objProps.push(`${name}: ${type}`);
                }
            }
            else {
                objProps.push(`${name}: ${type}`);
            }
        }

        return {
            end: i,
            type: objProps.join(', ')
        }
    }

    alias(start, indent, title, name, varType, properties, returnTag) {
        if (title === 'callback') {
            const returnType = returnTag ? determineVarType(returnTag.type) : 'void';
            const lines = [];
            const props = [];
            lines.push(`${this.blockPre}`);
            for (const property of properties) {
                const propType = determineVarType(property.type);
                props.push(`${property.name}: ${propType}`);
            }
            lines.push(`${indent}type ${name} = (${props.join(', ')}) => ${returnType};`);
            lines.push(`${indent}${this.blockPost}`);
            return {
                start: start,
                addition: lines.join('\n') + `\n${indent}`
            };
        }
        else {
            const type = determineVarType(varType);
            if (type.toLowerCase() === 'object' && properties.length) {
                const lines = [];
                const propLines = [];
                lines.push(`${this.blockPre}`);
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
                    addition: lines.join('\n') + `\n${indent}`
                };
            }
            else {
                return {
                    start: start,
                    addition: [
                        `${this.blockPre}`,
                        `${indent}type ${name} = ${type};`,
                        `${indent}${this.blockPost}`
                    ].join('\n') + `\n${indent}`
                };
            }
        }
    }
}
module.exports = FlowAnnotation;
