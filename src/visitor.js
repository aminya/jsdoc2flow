'use strict';

const doctrine = require('doctrine');
const _ = require('lodash');

class Visitor {
    constructor({ fixerIndex, sourceCode }) {
        this.fixerIndex = fixerIndex;
        this.sourceCode = sourceCode;
        this.visitedComments = [];
    }

    visit(node) {
        const newComments = [];
        const allComments = _.uniq(_.concat(
            node.leadingComments || [],
            node.comments || [],
            node.trailingComments || []
        ));

        allComments.forEach(comment => {
            const found = this.visitedComments.find(visited => _.isEqual(comment, visited));
            if (!found) {
                newComments.push(comment);
            }
        });

        let fixes = [];
        for (const comment of newComments) {
            // doctrine doesn't support default values, so modify the comment
            // value prior to feeding it to doctrine.
            let commentValue = comment.value;
            const paramRegExp = /(@param\s+{[^}]+}\s+)\[([^=])+=[^\]]+\]/g;
            commentValue = commentValue.replace(paramRegExp, (match, p1, p2) => {
                return `${p1}${p2}`;
            });

            const result = doctrine.parse(commentValue, { unwrap: true });
            const tags = result.tags;
            for (const tag of tags) {
                const fixer = this.fixerIndex[tag.title];
                if (!fixer) {
                    continue;
                }

                const context = {
                    comment: comment,
                    code: this.sourceCode,
                    tags: tags
                };
                fixes = _.concat(fixes, fixer.getFixes(tag, node, context));
            }
        }

        return fixes;
    }
}
module.exports = Visitor;
