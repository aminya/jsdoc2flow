import { readdirSync, readFileSync } from "fs"
import { isCodeEqual } from "./helper.js"

import Converter from "../src/index.js"
const converter = new Converter()

const orig = `${__dirname}/fixtures/orig`
const annotated = `${__dirname}/fixtures/annotated`

const numTest = readdirSync(orig).length

describe("full file", function () {
  for (let iTest = 1; iTest <= numTest; iTest++) {
    if (iTest === 3) {
      console.warn("Skipping test3 Related to https://github.com/aminya/jsdoc2flow/issues/7")
      continue
    }
    describe(`test${iTest}`, function () {
      it("should convert correctly", function () {
        const code = readFileSync(`${orig}/test${iTest}.js`).toString()
        const modifiedCode = converter.convertSourceCode(code)
        const expected = readFileSync(`${annotated}/test${iTest}.js`).toString()
        isCodeEqual(modifiedCode, expected)
      })
    })
  }
})
