'use strict';

class FixerIndex {
    constructor({ paramFixer, returnsFixer, typedefFixer, typeFixer, callbackFixer }) {
        this.fixers = {};

        // http://usejsdoc.org/tags-param.html
        this.fixers['@param'] = paramFixer;
        this.fixers['@arg'] = this.fixers['@param'];
        this.fixers['@argument'] = this.fixers['@param'];

        // http://usejsdoc.org/tags-returns.html
        this.fixers['@returns'] = returnsFixer;
        this.fixers['@return'] = this.fixers['@returns'];

        // http://usejsdoc.org/tags-typedef.html
        this.fixers['@typedef'] = typedefFixer;

        // http://usejsdoc.org/tags-type.html
        this.fixers['@type'] = typeFixer;

        // http://usejsdoc.org/tags-callback.html
        this.fixers['@callback'] = callbackFixer;
    }

    get(type) {
        return this.fixers[`@${type}`];
    }
}
module.exports = FixerIndex;
