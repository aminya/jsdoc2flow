"use strict"

const fs = require("fs")
const { isCodeEqual } = require("./helper")

const Converter = require("../src")
const converter = new Converter()

const orig = `${__dirname}/fixtures/orig`
const annotated = `${__dirname}/fixtures/annotated`

const numTest = fs.readdirSync(orig).length

describe("full file", function () {
  for (let iTest = 1; iTest <= numTest; iTest++) {
    describe(`test${iTest}`, function () {
      it("should convert correctly", function () {
        const code = fs.readFileSync(`${orig}/test${iTest}.js`).toString()
        const modifiedCode = converter.convertSourceCode(code)
        const expected = fs.readFileSync(`${annotated}/test${iTest}.js`).toString()
        isCodeEqual(modifiedCode, expected)
      })
    })
  }
})
