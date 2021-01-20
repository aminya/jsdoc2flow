'use strict';

const { isCodeEqual } = require('./helper')

const Converter = require('../src');
const converter = new Converter();

describe('callbackFixer', function() {
    describe('define callback type without return', function() {
        it('should insert new custom type', function() {
            const code = `
            /**
             * @callback MyCallback
             * @param {number} arg1
             */
            `;
            const modifiedCode = converter.convertSourceCode(code);
            isCodeEqual(modifiedCode, `

            type MyCallback = (arg1: number) => void;

            /**
             * @callback MyCallback
             * @param {number} arg1
             */
            `);
        });
    });

    describe('define callback type with return', function() {
        it('should insert new custom type', function() {
            const code = `
            /**
             * @callback MyCallback
             * @param {number} arg1
             * @return {number}
             */
            `;
            const modifiedCode = converter.convertSourceCode(code);
            isCodeEqual(modifiedCode, `

            type MyCallback = (arg1: number) => number;

            /**
             * @callback MyCallback
             * @param {number} arg1
             * @return {number}
             */
            `);
        });
    });
});
