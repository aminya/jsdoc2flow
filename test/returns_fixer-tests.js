'use strict';

require('should');

const Converter = require('../src');
const converter = new Converter();

describe('returnsFixer', function() {
    describe('return type of simple FunctionDeclaration', function() {
        it('should work', function() {
            const code = `
            /**
             * @returns {number}
             */
            function test() {
            }
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            /**
             * @returns {number}
             */
            function test() /*: number */ {
            }
            `);
        });
    });

    describe('return type of simple FunctionDeclaration but { and ) on separate lines', function() {
        it('should work', function() {
            const code = `
            /**
             * @returns {number}
             */
            function test()
            {
            }
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            /**
             * @returns {number}
             */
            function test() /*: number */
            {
            }
            `);
        });
    });

    describe('return type of FunctionDeclaration spread over multiple lines', function() {
        it('should work', function() {
            const code = `
            /**
             * @returns {number}
             */
            function test(
                a, b, c
            ) {
            }
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            /**
             * @returns {number}
             */
            function test(
                a, b, c
            ) /*: number */ {
            }
            `);
        });
    });

    describe('return type of FunctionExpression within ES6 class', function() {
        it('should work', function() {
            const code = `
            class Test {
                /**
                 * @returns {number}
                 */
                test() {
                }
            }
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            class Test {
                /**
                 * @returns {number}
                 */
                test() /*: number */ {
                }
            }
            `);
        });
    });

    describe('return type of ArrowFunctionExpression in an ExpressionStatement', function() {
        it('should work', function() {
            const code = `
            /**
             * @returns {number}
             */
            Something.prototype.test = () => {
            }
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            /**
             * @returns {number}
             */
            Something.prototype.test = () /*: number */ => {
            }
            `);
        });
    });

    describe('return type of FunctionExpression in an ExpressionStatement', function() {
        it('should work', function() {
            const code = `
            /**
             * @returns {number}
             */
            Something.prototype.test = function() {
            }
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            /**
             * @returns {number}
             */
            Something.prototype.test = function() /*: number */ {
            }
            `);
        });
    });

    describe('return type of FunctionExpression in a variable declaration', function() {
        it('should work', function() {
            const code = `
            /**
             * @returns {number}
             */
            const test = function() {
            }
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            /**
             * @returns {number}
             */
            const test = function() /*: number */ {
            }
            `);
        });
    });

    describe('return type of a FunctionExpression for an object property', function() {
        it('should work', function() {
            const code = `
            const obj = {
                /**
                 * @returns {number}
                 */
                foo: function() {
                }
            };
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            const obj = {
                /**
                 * @returns {number}
                 */
                foo: function() /*: number */ {
                }
            };
            `);
        });
    });

    describe('return type for arrow function with brackets', function() {
        it('should work', function() {
            const code = `
            /**
             * @returns {number}
             */
            const test = (a) => {
            };
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            /**
             * @returns {number}
             */
            const test = (a) /*: number */ => {
            };
            `);
        });
    });

    describe('return type for arrow function without brackets', function() {
        it('should work but does not change anything', function() {
            const code = `
            /**
             * @returns {number}
             */
            const test = a => {
            };
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            /**
             * @returns {number}
             */
            const test = a => {
            };
            `);
        });
    });

    describe('Promise return type', function() {
        it('should work but does not change anything', function() {
            const code = `
            /**
             * @returns {Promise<number>}
             */
            function test() {
            };
            `;
            const modifiedCode = converter.convertSourceCode(code);
            modifiedCode.should.be.eql(`
            /**
             * @returns {Promise<number>}
             */
            function test() /*: Promise<number> */ {
            };
            `);
        });
    });
});
