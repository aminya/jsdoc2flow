'use strict';

require('should');

const Converter = require('../src');
const converter = new Converter();

describe('typedefFixer', function() {
    describe('alias simple primitive type', function() {
        it('should insert additional comment', function() {
            const code = `
            /**
             * @typedef {number} MyNumber
             */
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`            /*::
            type MyNumber = number;
            */
            /**
             * @typedef {number} MyNumber
             */
            `);
        });
    });

    describe('alias union type', function() {
        it('should insert additional comment', function() {
            const code = `
            /**
             * @typedef {number|boolean} MyUnion
             */
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`            /*::
            type MyUnion = number | boolean;
            */
            /**
             * @typedef {number|boolean} MyUnion
             */
            `);
        });
    });

    describe('alias object type', function() {
        it('should insert additional comment', function() {
            const code = `
            /**
             * @typedef {object} MyObject
             * @property {boolean} prop1
             * @property {boolean} prop2
             */
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`            /*::
            type MyObject = {
              prop1: boolean,
              prop2: boolean
            };
            */
            /**
             * @typedef {object} MyObject
             * @property {boolean} prop1
             * @property {boolean} prop2
             */
            `);
        });
    });

    describe('alias simple primitive type via @type', function() {
        it('should change nothing because doctrine does not support this', function() {
            const code = `
            /**
             * @typedef MyNumber
             * @type {number}
             */
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            /**
             * @typedef MyNumber
             * @type {number}
             */
            `);
        });
    });
});
