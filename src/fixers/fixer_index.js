'use strict';

class FixerIndex {
    constructor({ paramFixer, returnsFixer }) {
        // http://usejsdoc.org/tags-param.html
        this.param = paramFixer;
        this.arg = this.param;
        this.argument = this.param;

        // http://usejsdoc.org/tags-returns.html
        this.returns = returnsFixer;
        this.return = this.returns;
    }
}
module.exports = FixerIndex;
