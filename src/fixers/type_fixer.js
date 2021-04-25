"use strict"

class TypeFixer {
  constructor({ flowAnnotation }) {
    this.flowAnnotation = flowAnnotation
  }

  getFixes(tag, node, { comment }) {
    const fixes = []

    if (node.type !== "VariableDeclaration") {
      return fixes
    }

    // @type always applies to things that come after it
    if (node.trailingComments && node.trailingComments.includes(comment)) {
      return fixes
    }

    if (node.type === "VariableDeclaration") {
      if (node.declarations.length !== 1) {
        return fixes
      }

      const varID = node.declarations[0].id
      fixes.push(this.flowAnnotation.inline(varID.end, tag.type))
    }

    return fixes
  }
}
module.exports = TypeFixer
