const fs = require("fs")
const espree = require("espree")
const { Linter } = require("eslint")
const linter = new Linter()
const _ = require("lodash")
const { createContainer, Lifetime, asValue } = require("awilix")
const babelParser = require("@babel/eslint-parser")

const visitorKeys = require("./visitor_keys.js")

class Converter {
  constructor(options = {}) {
    this.espreeOptions = {
      attachComment: true,
      ecmaVersion: options.ecmaVersion || 2019,
      sourceType: options.sourceType || "module",
      ecmaFeatures: options.ecmaFeatures || {
        // enable JSX parsing
        jsx: true,
      },
    }
    this.options = options

    this.container = this._createContainer(options)
  }

  convertFile(inputFilePath, outputFilePath) {
    const code = fs.readFileSync(inputFilePath).toString()
    const modifiedCode = this.convertSourceCode(code)
    fs.writeFileSync(outputFilePath, modifiedCode)

    // Retain the same permissions
    const fstat = fs.lstatSync(inputFilePath)
    fs.chmodSync(outputFilePath, fstat.mode)
  }

  convertSourceCode(code) {
    // Check to see if this code is being used as a script.
    // i.e. first line having something like `#!/usr/bin/env node`
    //
    // If it is, strip it out before trying to parse it.
    const regExp = /^(#![^\n]+\n)/
    const matches = code.match(regExp)
    if (matches) {
      code = code.replace(regExp, "")
    }

    let ast
    let dynamicImportPatch = false
    try {
      ast = espree.parse(code, this.espreeOptions)
    } catch (e) {
      if (e.message.indexOf("Unexpected token import") >= 0) {
        dynamicImportPatch = true
        // We cannot update espree because attachComment option is removed, so to support `dynamic imports`,
        // we need to do this hack
        const dynamicImportRegExp = /import\s*\((.*)\)/
        code = code.replace(dynamicImportRegExp, (importGroup, valueGroup) => {
          return `ESPREE_DYNAMIC_IMPORT(${valueGroup})`
        })
        ast = espree.parse(code, this.espreeOptions)
      } else {
        throw new Error(`Failed to parse code: ${e.message}`)
      }
    }

    if (!this.options.flowCommentSyntax) {
      // Add arrow parens so we can add types
      const message = linter.verifyAndFix(code, {
        parser: "espree",
        parserOptions: this.espreeOptions,
        rules: {
          "arrow-parens": 2,
        },
        fix: true,
      })
      if (message.fixed) {
        code = message.output
        // reparse
        ast = espree.parse(code, this.espreeOptions)
      }
    }

    const scope = this.container.createScope()
    scope.register({ sourceCode: asValue(code) })
    const visitor = scope.cradle.visitor
    let fixes = []
    this._traverseAST(ast, (n) => (fixes = _.concat(fixes, visitor.visit(n))))

    let modifiedCode = this._applyFixes(code, fixes)
    if (matches) {
      // Put back the first line if it was stripped out before.
      modifiedCode = `${matches[1]}${modifiedCode}`
    }

    if (dynamicImportPatch) {
      const dynamicImportRegExp = /ESPREE_DYNAMIC_IMPORT\s*\((.*)\)/
      modifiedCode = modifiedCode.replace(dynamicImportRegExp, (importGroup, valueGroup) => {
        return `import(${valueGroup})`
      })
    }

    // Check if the generated code is valid
    try {
      babelParser.parse(modifiedCode, {
        ...this.espreeOptions,
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

    return modifiedCode
  }

  _traverseAST(ast, visit) {
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

  _applyFixes(code, fixes) {
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

  _createContainer(options) {
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
}
module.exports = Converter
