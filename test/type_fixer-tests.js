import { isCodeEqual } from "./helper.js"

import Converter from "../src/index.js"
const converter = new Converter()

describe("typeFixer", function () {
  describe("specify type on variable declaration", function () {
    it("should work", function () {
      const code = `
            /** @type {number} */
            const count = 1;
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /** @type {number} */
            const count : number = 1;
            `
      )
    })
  })

  describe("specify type between variable declarations", function () {
    it("should not get confused", function () {
      const code = `
            const var1 = 2;
            /** @type {number} */
            const count = 1;
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            const var1 = 2;
            /** @type {number} */
            const count : number = 1;
            `
      )
    })
  })
})
