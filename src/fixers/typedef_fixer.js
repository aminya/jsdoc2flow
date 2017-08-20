'use strict';

class TypedefFixer {
    constructor({ flowAnnotation }) {
        this.flowAnnotation = flowAnnotation;
    }

    getFixes(tag, node, { comment, tags }) {
        const fixes = [];

        if (tags[0].title !== 'typedef') {
            return fixes;
        }

        // Figure out the indent
        let indent = '';
        const matches = comment.value.match(/\n(\s+)$/);
        if (matches) {
            indent = matches[1].replace(/ $/, '');
        }

        const properties = tags.filter(t => {
            return ['property', 'prop'].includes(t.title);
        });
        fixes.push(this.flowAnnotation.alias(node.start, indent, tag.title, tag.name, tag.type, properties));

        return fixes;
    }
}
module.exports = TypedefFixer;
