'use strict';

require('should');

const Converter = require('../src');
const converter = new Converter();

describe('typeFixer', function() {
    describe('specify type on variable declaration', function() {
        it('should work', function() {
            const code = `
            /** @type {number} */
            const count = 1;
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            /** @type {number} */
            const count /*: number */ = 1;
            `);
        });
    });
});
