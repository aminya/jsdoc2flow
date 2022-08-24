import { readFileSync, writeFileSync, lstatSync, chmodSync } from "fs"
import { parse } from "espree-attachcomment"
import { KEYS as visitorKeys } from "eslint-visitor-keys"
import { Linter } from "eslint"
const linter = new Linter()
import { concat } from "lodash"
import { createContainer, Lifetime, asValue } from "awilix"
import { parse as _parse } from "@babel/eslint-parser"

class Converter {
  constructor(options = {}) {
    this.espreeOptions = {
      comment: true,
      attachComment: true,
      ecmaVersion: options.ecmaVersion || 2021,
      sourceType: options.sourceType || "module",
      ecmaFeatures: options.ecmaFeatures || {
        // enable JSX parsing
        jsx: true,
      },
    }
    this.options = options

    this.container = _createContainer(options)
  }

  convertFile(inputFilePath, outputFilePath) {
    const code = readFileSync(inputFilePath).toString()
    const modifiedCode = this.convertSourceCode(code)
    writeFileSync(outputFilePath, modifiedCode)

    // Retain the same permissions
    const fstat = lstatSync(inputFilePath)
    chmodSync(outputFilePath, fstat.mode)
  }

  convertSourceCode(givenCode) {
    const { code, matches } = prepareCode(givenCode, this.espreeOptions, this.flowCommentSyntax)

    const ast = parse(code, this.espreeOptions)

    const scope = this.container.createScope()
    scope.register({ sourceCode: asValue(code) })
    const visitor = scope.cradle.visitor
    let fixes = []
    _traverseAST(ast, (n) => (fixes = concat(fixes, visitor.visit(n))))

    const modifiedCode = _applyFixes(code, fixes)
    const finalCode = postProcessCode(modifiedCode, matches)

    if (this.options.validate !== false) {
      validateCode(finalCode, this.espreeOptions)
    }

    return finalCode
  }
}
export default Converter

function prepareCode(givenCode, espreeOptions, flowCommentSyntax) {
  let code = givenCode

  // Check to see if this code is being used as a script.
  // i.e. first line having something like `#!/usr/bin/env node`
  //
  // If it is, strip it out before trying to parse it.
  const regExp = /^(#![^\n]+\n)/
  const matches = code.match(regExp)
  if (matches) {
    code = code.replace(regExp, "")
  }

  // Add arrow parens so we can add types
  if (!flowCommentSyntax) {
    const message = linter.verifyAndFix(code, {
      parser: "espree",
      parserOptions: espreeOptions,
      rules: {
        "arrow-parens": 2,
      },
      fix: true,
    })
    if (message.fixed) {
      code = message.output
    }
  }
  return { code, matches }
}

function validateCode(modifiedCode, espreeOptions) {
  // Check if the generated code is valid
  try {
    _parse(modifiedCode, {
      ...espreeOptions,
      requireConfigFile: false,
      allowImportExportEverywhere: true,
      babelOptions: {
        plugins: [
          // enable jsx and flow syntax
          "@babel/plugin-syntax-flow",
          "@babel/plugin-syntax-jsx",
        ],
      },
    })
  } catch (e) {
    console.warn(e)
  }
}

function postProcessCode(modifiedCode, matches) {
  let finalCode = modifiedCode

  // Put back the first line if it was stripped out before.
  if (matches) {
    finalCode = `${matches[1]}${finalCode}`
  }
  return finalCode
}

function _traverseAST(ast, visit) {
  const stack = [ast]

  while (stack.length) {
    const node = stack.pop()
    if (visit) {
      visit(node)
    }

    const keys = visitorKeys[node.type]
    if (keys === undefined) {
      continue
    }
    for (const key of keys) {
      const prop = node[key]
      if (Array.isArray(prop)) {
        for (let i = prop.length - 1; i >= 0; i--) {
          if (prop[i]) {
            stack.push(prop[i])
          }
        }
      } else if (prop) {
        stack.push(prop)
      }
    }
  }
}

function _applyFixes(code, fixes) {
  let modifiedCode = code
  let offset = 0

  // Sort fixes by start location
  fixes.sort((a, b) => a.start - b.start)

  for (const entry of fixes) {
    const before = modifiedCode.substring(0, entry.start + offset)
    const after = modifiedCode.substring(entry.start + offset)
    modifiedCode = before + entry.addition + after
    offset += entry.addition.length
  }

  return modifiedCode
}

function _createContainer(options) {
  const container = createContainer()
  container.register({ useFlowCommentSyntax: asValue(options.flowCommentSyntax || false) })
  container.loadModules(["./flow_annotation.js", "./fixers/*.js", ["./visitor.js", Lifetime.SCOPED]], {
    registrationOptions: {
      lifetime: Lifetime.SINGLETON,
    },
    cwd: __dirname,
    formatName: "camelCase",
  })
  return container
}
