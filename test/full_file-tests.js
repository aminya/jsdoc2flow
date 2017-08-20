'use strict';

require('should');
const fs = require('fs');

const Converter = require('../src');
const converter = new Converter();

const orig = `${__dirname}/fixtures/orig`;
const annotated = `${__dirname}/fixtures/annotated`;

describe('full file', function() {
    describe.only('test1', function() {
        it('should convert correctly', function() {
            const code = fs.readFileSync(`${orig}/test1.js`).toString();
            const modifiedCode = converter.convertSourceCode(code);
            const expected = fs.readFileSync(`${annotated}/test1.js`).toString();
            modifiedCode.should.be.eql(expected);
        });
    });
});
