'use strict';

require('should');

const Converter = require('../src');
const converter = new Converter();

describe('propertyFixer', function() {
    describe('specify property on ES6 class variation 1', function() {
        it('should work', function() {
            const code = `
            /**
             * @property {number} count
             */
            class Test {
            }
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            /**
             * @property {number} count
             */
            class Test {
            /*::
            count: number;
            */
            }
            `);
        });
    });

    describe('specify property on ES6 class variation 2', function() {
        it('should work', function() {
            const code = `
            /**
             * @property {number} count
             */
            class Test
            {
            }
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            /**
             * @property {number} count
             */
            class Test
            {
            /*::
            count: number;
            */
            }
            `);
        });
    });

    describe('multiple properties', function() {
        it('should work', function() {
            const code = `
            /**
             * @property {number} prop1
             * @property {number} prop2
             */
            class Test {
            }
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            /**
             * @property {number} prop1
             * @property {number} prop2
             */
            class Test {
            /*::
            prop1: number;
            prop2: number;
            */
            }
            `);
        });
    });
});
