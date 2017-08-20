'use strict';

class CallbackFixer {
    constructor({ flowAnnotation }) {
        this.flowAnnotation = flowAnnotation;
    }

    getFixes(tag, node, { comment, tags }) {
        const fixes = [];

        if (tags[0].title !== 'callback') {
            return fixes;
        }

        // Figure out the indent
        let indent = '';
        const matches = comment.value.match(/\n(\s+)$/);
        if (matches) {
            indent = matches[1].replace(/ $/, '');
        }

        const params = tags.filter(t => {
            return ['param', 'arg', 'argument'].includes(t.title);
        });
        const returnTags = tags.filter(t => {
            return ['return', 'returns'].includes(t.title);
        });
        if (returnTags.length > 1) {
            throw new Error('@callback encountered multiple return types');
        }
        fixes.push(this.flowAnnotation.alias(comment.start, indent, tag.title, tag.description, null, params, returnTags[0]));

        return fixes;
    }
}
module.exports = CallbackFixer;
