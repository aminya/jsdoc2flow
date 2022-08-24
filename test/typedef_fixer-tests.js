import { isCodeEqual } from "./helper.js"

import Converter from "../src/index.js"
const converter = new Converter()

describe("typedefFixer", function () {
  describe("alias simple primitive type", function () {
    it("should insert additional comment", function () {
      const code = `
            /**
             * @typedef {number} MyNumber
             */
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `

            type MyNumber = number;

            /**
             * @typedef {number} MyNumber
             */
            `
      )
    })
  })

  describe("alias union type", function () {
    it("should insert additional comment", function () {
      const code = `
            /**
             * @typedef {number|boolean} MyUnion
             */
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `

            type MyUnion = number | boolean;

            /**
             * @typedef {number|boolean} MyUnion
             */
            `
      )
    })
  })

  describe("alias object type", function () {
    it("should insert additional comment", function () {
      const code = `
            /**
             * @typedef {object} MyObject
             * @property {boolean} prop1
             * @property {boolean} prop2
             */
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `

            type MyObject = {
              prop1: boolean,
              prop2: boolean
            };

            /**
             * @typedef {object} MyObject
             * @property {boolean} prop1
             * @property {boolean} prop2
             */
            `
      )
    })
  })

  describe("alias simple primitive type via @type", function () {
    it("just assigns to itself because doctrine/comment-parser doesn't support it", function () {
      const code = `
            /**
             * @typedef MyNumber
             * @type {number}
             */
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            type MyNumber = MyNumber

            /**
             * @typedef MyNumber
             * @type {number}
             */
            `
      )
    })
  })
})
