"use strict"

const doctrine = require("doctrine")
const { parse } = require("comment-parser/lib")

const _ = require("lodash")


function parseCommentParser(comment) {
  const commentValueCommentParser = comment.value.indexOf("*\n") === 0 ? `/*${comment.value}*/` : comment.value
  return parse(commentValueCommentParser)[0] || []
}

class Visitor {
  constructor({ fixerIndex, sourceCode }) {
    this.fixerIndex = fixerIndex
    this.sourceCode = sourceCode
    this.visitedComments = []
  }

  visit(node) {
    const newComments = []
    const allComments = _.uniq(_.concat(node.leadingComments || [], node.comments || [], node.trailingComments || []))

    allComments.forEach((comment) => {
      const found = this.visitedComments.find((visited) => _.isEqual(comment, visited))
      if (!found) {
        newComments.push(comment)
      }
    })

    let fixes = []
    for (const comment of newComments) {
      // doctrine doesn't support default values, so modify the comment
      // value prior to feeding it to doctrine.
      let commentValue = comment.value
      const paramRegExp = /(@param\s+{[^}]+}\s+)\[([^=])+=[^\]]+\]/g
      commentValue = commentValue.replace(paramRegExp, (match, p1, p2) => {
        return `${p1}${p2}`
      })

      // Comment-Parser
      const resultCommentParser = parseCommentParser(comment)

      const tagsCommentParser = resultCommentParser.tags

      let processedComment = false

      const result = doctrine.parse(commentValue, { unwrap: true })
      const tags = result.tags
      for (const tag of tags) {
        const fixer = this.fixerIndex.get(tag.title)
        if (!fixer) {
          continue
        }

        const context = {
          comment: comment,
          code: this.sourceCode,
          tags: tags,
        }
        const newFixes = fixer.getFixes(tag, node, context)
        fixes = _.concat(fixes, newFixes)

        if (newFixes.length) {
          processedComment = true
        }
      }

      if (processedComment) {
        this.visitedComments.push(comment)
      }
    }

    return fixes
  }
}
module.exports = Visitor
