'use strict';

class FixerIndex {
    constructor({ paramFixer, returnsFixer, typedefFixer, callbackFixer }) {
        // http://usejsdoc.org/tags-param.html
        this.param = paramFixer;
        this.arg = this.param;
        this.argument = this.param;

        // http://usejsdoc.org/tags-returns.html
        this.returns = returnsFixer;
        this.return = this.returns;

        // http://usejsdoc.org/tags-typedef.html
        this.typedef = typedefFixer;

        // http://usejsdoc.org/tags-callback.html
        this.callback = callbackFixer;
    }
}
module.exports = FixerIndex;
