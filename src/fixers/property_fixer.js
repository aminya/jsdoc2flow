"use strict"

const _ = require("lodash")

class PropertyFixer {
  constructor({ flowAnnotation }) {
    this.flowAnnotation = flowAnnotation
  }

  getFixes(tag, node, { tags, code, comment }) {
    const fixes = []

    if (node.type != "ClassDeclaration") {
      return fixes
    }

    // @property always applies to things that come after it
    if (node.trailingComments && node.trailingComments.includes(comment)) {
      return fixes
    }

    const propTags = tags.filter((t) => t.title === "property" || t.title === "prop")
    const index = propTags.indexOf(tag)
    if (index !== 0) {
      // Don't process @property tags that aren't the first one.
      // They're processed as a block.
      return fixes
    }

    // Figure out how much the class definition was indented by
    let lineStart = node.start
    for (let i = node.start - 1; i >= 0; i--) {
      if (code[i] === "\n") {
        lineStart = i
        break
      }
    }
    const classIndent = _.repeat(" ", node.start - 1 - lineStart)

    fixes.push(this.flowAnnotation.inlineProps(node.body.start + 1, classIndent, tags))

    return fixes
  }
}
module.exports = PropertyFixer
