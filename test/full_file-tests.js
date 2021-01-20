'use strict';

require('should');
const fs = require('fs');
const { format } = require("prettier");

const Converter = require('../src');
const converter = new Converter();

const orig = `${__dirname}/fixtures/orig`;
const annotated = `${__dirname}/fixtures/annotated`;

describe('full file', function() {
    describe('test1', function() {
        it('should convert correctly', function() {
            const code = fs.readFileSync(`${orig}/test1.js`).toString();
            const modifiedCode = converter.convertSourceCode(code);
            const expected = fs.readFileSync(`${annotated}/test1.js`).toString();
            format(modifiedCode).should.be.eql(format(expected));
        });
    });

    describe('test2', function() {
        it('should convert correctly', function() {
            const code = fs.readFileSync(`${orig}/test2.js`).toString();
            const modifiedCode = converter.convertSourceCode(code);
            const expected = fs.readFileSync(`${annotated}/test2.js`).toString();
            format(modifiedCode).should.be.eql(format(expected));
        });
    });
});
