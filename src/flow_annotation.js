"use strict"

function typeSubstitute(typeName) {
  if (typeName !== undefined && typeName.toLowerCase() === "object") {
    return "{}"
  }
  return typeName
}

function literalParse(element) {
  if (element.type === "NullLiteral") {
    return "null"
  } else if (element.type === "UndefinedLiteral") {
    return "undefined"
  } else if (element.type === "VoidLiteral") {
    return "void"
  } else if (element.type === "AllLiteral") {
    return "any"
  } else if (element.type.indexOf("Literal") >= 0) {
    // other types of literals
    const value = typeSubstitute(element.type.replace("Literal", "").toLowerCase())
    return value
  } else {
    return null
  }
}

function determineVarType(varType) {
  // non-doctrine comments
  if (typeof varType === "string") {
    return varType
  }
  if (varType.type === "NameExpression") {
    return typeSubstitute(varType.name)
  } else if (varType.type === "TypeApplication") {
    const innerTypes = varType.applications.map((a) => typeSubstitute(determineVarType(a)))
    return `${typeSubstitute(determineVarType(varType.expression))}<${innerTypes.join(", ")}>`
  } else if (varType.type === "OptionalType" || varType.type === "NullableType") {
    return `?${typeSubstitute(determineVarType(varType.expression))}`
  } else if (varType.type === "UnionType") {
    const elements = varType.elements
    const elementsNames = elements.map((e) => determineVarType(e))
    return elementsNames.join(" | ")
  } else if (varType.type.indexOf("Literal") >= 0) {
    return literalParse(varType)
  } else if (varType.type === "FunctionType") {
    const params = varType.params
    const paramsNames = params.map((p) => determineVarType(p))
    return `(${paramsNames.join(", ")}) => ${determineVarType(varType.result)}`
  } else if (varType.type === "ParameterType") {
    return `${varType.name}: ${determineVarType(varType.expression)}`
  } else if (varType.type === "ArrayType") {
    const elements = varType.elements
    const elementsNames = elements.map((e) => determineVarType(e))
    return `[${elementsNames.join(", ")}]`
  }
  console.warn(`Warning: unknown '${varType.type}' type - ${JSON.stringify(varType)}
        Open an issue at https://github.com/aminya/jsdoc2flow/issues/new
    `)
}

class FlowAnnotation {
  constructor({ useFlowCommentSyntax = false } = {}) {
    if (useFlowCommentSyntax) {
      this.inlinePre = " /*"
      this.inlinePost = " */"
      this.blockPre = "/*::"
      this.blockPost = "*/"
    } else {
      this.inlinePre = ""
      this.inlinePost = ""
      this.blockPre = ""
      this.blockPost = ""
    }
  }

  inline(start, varType, isRestParam) {
    let addition = ""
    if (varType) {
      let type = determineVarType(varType)
      if (isRestParam) {
        type = `Array<${type}>`
      }
      addition = `${this.inlinePre}: ${type}${this.inlinePost}`
    }
    return {
      start,
      addition,
    }
  }

  inlineProps(start, classIndent, tags) {
    const lines = []
    for (const tag of tags) {
      const type = determineVarType(tag.type)
      lines.push(`${classIndent}${tag.name}: ${type};`)
    }
    const props = lines.join("\n")

    return {
      start,
      addition: `\n${classIndent}${this.blockPre}\n${props}\n${classIndent}${this.blockPost}`,
    }
  }

  inlineObj(start, tags, ids = []) {
    let addition = ""
    tags.sort((a, b) => {
      if (b.name > a.name) {
        return -1
      } else if (a.name > b.name) {
        return 1
      }
      return 0
    })

    const result = this._transformTags(tags, ids, 0)

    addition = `${this.inlinePre}: { ${result.type} }${this.inlinePost}`
    return {
      start,
      addition,
    }
  }

  _transformTags(tags, ids, start) {
    const objProps = []
    let i = start
    for (; i < tags.length; i++) {
      const tag = tags[i]

      const nameParts = tag.name.split(".")

      let type = determineVarType(tag.type)
      if (type === undefined) {
        continue
      }

      let name = nameParts[nameParts.length - 1]
      const idEntry = ids.find((iID) => iID.id === name)
      if (type.startsWith("?")) {
        name += "?"
      }

      if (idEntry && idEntry.hasDefault && type.startsWith("?")) {
        type = type.substring(1)
      }

      if (type.toLowerCase().replace(/^\?/, "") === "{}") {
        if (i + 1 < tags.length && tags[i + 1].name.startsWith(tag.name)) {
          const result = this._transformTags(tags, ids, i + 1)
          i = result.end + 1
          objProps.push(`${name}: { ${result.type} }`)
        } else {
          objProps.push(`${name}: ${type}`)
        }
      } else {
        objProps.push(`${name}: ${type}`)
      }
    }

    return {
      end: i,
      type: objProps.join(", "),
    }
  }

  alias(start, indent, title, name, varType, properties, returnTag) {
    if (title === "callback") {
      const returnType = returnTag ? determineVarType(returnTag.type) : "void"
      const lines = []
      const props = []
      lines.push(`${this.blockPre}`)
      for (const property of properties) {
        const propType = determineVarType(property.type)
        props.push(`${property.name}: ${propType}`)
      }
      lines.push(`${indent}type ${name} = (${props.join(", ")}) => ${returnType};`)
      lines.push(`${indent}${this.blockPost}`)
      return {
        start,
        addition: `${lines.join("\n")}\n${indent}`,
      }
    } else {
      const type = determineVarType(varType)
      if (type.toLowerCase() === "{}" && properties.length) {
        const lines = []
        const propLines = []
        lines.push(`${this.blockPre}`)
        lines.push(`${indent}type ${name} = {`)
        for (const property of properties) {
          const propType = determineVarType(property.type)
          propLines.push(`${indent}  ${property.name}: ${propType}`)
        }
        lines.push(propLines.join(",\n"))
        lines.push(`${indent}};`)
        lines.push(`${indent}${this.blockPost}`)
        return {
          start,
          addition: `${lines.join("\n")}\n${indent}`,
        }
      } else {
        return {
          start,
          addition: `${[`${this.blockPre}`, `${indent}type ${name} = ${type};`, `${indent}${this.blockPost}`].join(
            "\n"
          )}\n${indent}`,
        }
      }
    }
  }
}
module.exports = FlowAnnotation
