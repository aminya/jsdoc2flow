'use strict';

require('should');
const fs = require('fs');

const Converter = require('../src');

const orig = `${__dirname}/fixtures/orig`;
const annotated = `${__dirname}/fixtures/annotated`;

describe('full file', function() {
    describe('test1', function() {
        it('should convert correctly', function() {
            const converter = new Converter();
            const code = fs.readFileSync(`${orig}/test1.js`).toString();
            const modifiedCode = converter.convertSourceCode(code);
            const expected = fs.readFileSync(`${annotated}/test1.js`).toString();
            modifiedCode.should.be.eql(expected);
        });
    });

    describe('test2', function() {
        it('should convert correctly', function() {
            const converter = new Converter();
            const code = fs.readFileSync(`${orig}/test2.js`).toString();
            const modifiedCode = converter.convertSourceCode(code);
            const expected = fs.readFileSync(`${annotated}/test2.js`).toString();
            modifiedCode.should.be.eql(expected);
        });
    });

    describe('test3', function() {
        it('should convert correctly', function() {
            const converter = new Converter({ ecmaVersion: 8 });
            const code = fs.readFileSync(`${orig}/test3.js`).toString();
            const modifiedCode = converter.convertSourceCode(code);
            const expected = fs.readFileSync(`${annotated}/test3.js`).toString();
            modifiedCode.should.be.eql(expected);
        });
    });
});
