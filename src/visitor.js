"use strict"

const doctrine = require("doctrine")
const { parse } = require("comment-parser/lib")

const _ = require("lodash")

// a function to add doctorine information into comment-parse tags
function injectCommentParserToDoctrine(tagDoctrine, tagCommentParser) {
  const tag = tagDoctrine

  // from comment-parser
  tag.typeText = tagCommentParser.type

  return tag
}

function injectDoctrineToCommentParser(tagDoctrine, tagCommentParser) {
  const tag = tagCommentParser

  tag.title = tagCommentParser.tag

  // use type to store doctrine types and use typeText to store comment-parser type
  tag.typeText = tagCommentParser.type
  tag.type = tagDoctrine.type

  // doctrine uses description
  if (tagCommentParser.description === "") {
    // example: /** @callback promiseMeCoroutine */
    tag.description = tagDoctrine.description // tagCommentParser.name
  }

  return tag
}

function parseDoctrine(comment) {
  try {
    // doctrine doesn't support default values, so modify the comment
    // value prior to feeding it to doctrine.
    let commentValueDoctrine = comment.value
    const paramRegExp = /(@param\s+{[^}]+}\s+)\[([^=])+=[^\]]+]/g
    commentValueDoctrine = commentValueDoctrine.replace(paramRegExp, (match, p1, p2) => {
      return `${p1}${p2}`
    })
    return doctrine.parse(commentValueDoctrine, { unwrap: true })
  } catch (e) {
    console.warn(e)
    return { tags: [] }
  }
}

/** Comments on ES exported functions/variables should be used for the actual declaration */
function addCommentToDeclaration(node) {
  if (node.declaration && (node.type === "ExportNamedDeclaration" || node.type === "ExportDefaultDeclaration")) {
    if (node.leadingComments) {
      node.declaration.leadingComments = node.leadingComments
    } else if (node.trailingComments) {
      node.declaration.trailingComments = node.trailingComments
    } else if (node.comments) {
      node.declaration.comments = node.comments
    }
    return true
  }
  return false
}

function parseCommentParser(comment) {
  try {
    // add jsdoc around the comment value so comment-parser can parse it correctly
    const commentValueCommentParser = `/*${comment.value}*/`
    return parse(commentValueCommentParser)[0]
  } catch (e) {
    console.warn(e)
    return { tags: [] }
  }
}

class Visitor {
  constructor({ fixerIndex, sourceCode }) {
    this.fixerIndex = fixerIndex
    this.sourceCode = sourceCode
    this.visitedComments = []
  }

  visit(node) {
    if (addCommentToDeclaration(node)) {
      return []
    }
    const newComments = []
    const allComments = _.uniq(_.concat(node.leadingComments || [], node.comments || [], node.trailingComments || []))

    // find a way to detect doc string that is related to commented code
    // for (let iComment = 0; iComment < allComments.length; iComment++) {
    //   // if there is a line comment in between descard before it
    //   if (allComments[iComment].type === "Line") {
    //     allComments = allComments.slice(iComment + 1) // if iComment === len returns []
    //     // recursive
    //   }
    // }

    allComments.forEach((comment) => {
      const found = this.visitedComments.find((visited) => _.isEqual(comment, visited))
      if (!found) {
        newComments.push(comment)
      }
    })

    let fixes = []
    for (const comment of newComments) {
      // Doctrine
      const resultDoctrine = parseDoctrine(comment)
      const tagsDoctrine = resultDoctrine.tags

      // Comment-Parser
      const resultCommentParser = parseCommentParser(comment)

      let tagsCommentParser
      if (resultCommentParser) {
        // normally
        tagsCommentParser = resultCommentParser.tags
      } else {
        // find typeText manually
        const maybeTypeText = comment.value.match(/@.*\s+{(.*)}/)
        let typeText = ""
        if (maybeTypeText && maybeTypeText.length >= 1) {
          typeText = maybeTypeText[0]
        }
        tagsCommentParser = tagsDoctrine
        for (let iTag = 0; iTag < tagsDoctrine.length; iTag++) {
          tagsCommentParser[iTag] = injectCommentParserToDoctrine(tagsDoctrine[iTag], { type: typeText })
        }
      }

      // final tags
      const tags = tagsCommentParser
      if (tagsCommentParser.length === tagsDoctrine.length) {
        // merge comment parser info into doctorine
        for (let iTag = 0; iTag < tagsDoctrine.length; iTag++) {
          tags[iTag] = injectDoctrineToCommentParser(tagsDoctrine[iTag], tagsCommentParser[iTag])
        }
      } else {
        // happens when comment parser supports something but doctorine does not
        // merge comment parser info into doctorine
        for (let iTag = 0; iTag < tagsCommentParser.length; iTag++) {
          const tagCommentParser = tagsCommentParser[iTag]

          // find the corresponding tag in doctrine
          const tagDoctrine = tagsDoctrine.find(
            (td) => td.title === tagCommentParser.tag && td.name === tagCommentParser.name
          ) || { type: tagCommentParser.type || tagCommentParser.name }

          tags[iTag] = injectDoctrineToCommentParser(tagDoctrine, tagCommentParser)
        }
      }

      let processedComment = false

      for (const tag of tags) {
        const fixer = this.fixerIndex.get(tag.title)
        if (!fixer) {
          continue
        }

        const context = {
          comment,
          code: this.sourceCode,
          tags,
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
