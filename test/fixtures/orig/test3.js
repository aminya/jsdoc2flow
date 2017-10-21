/* @flow */

/**
 * A simple class
 *
 * @property {string} prop1
 * @property {number} prop2
 */
class MyClass {

    /**
     * @constructs
     * @param {string} prop1
     * @param {?number} prop2
     */
    constructor(prop1, prop2 = 0) {
        this.prop1 = prop1;
        this.prop2 = prop2;
    }

    toJSON() {
        return { ...this };
    }
}


/**
 * @param {*} whatever - A parameter
 * @param {?Array<Array<string>>} tuples - A list of tuples
 * @returns {undefined} nothing
 * @throws {Error}
 */
function justThrow(whatever, tuples) {
    throw new Error(`it throws: ${tuples.join('|')}` );
}


/**
 * @typedef {Object} Secret
 * @property {string} hash
 * @property {string} salt
 */

/**
 * Compare a secret with something
 *
 * @param {string} str
 * @param {Secret} truth
 * @returns {boolean}
 */
function compare(str, { hash, salt }) {
    return str === hash + salt;
}

/**
 * Compare a secret with something
 *
 * @param {string} str
 * @param {Object} truth
 * @param {string} truth.hash
 * @param {string} truth.salt
 * @returns {boolean}
 */
function compare2(str, { hash, salt }) {
    return str === hash + salt;
}


/**
 * Verify something to a 3rd-party
 *
 * @param {string} smth
 * @returns {Promise.<boolean>}
 */
async function verify(smth) {
    const res = await request(() => smth);

    return res.value > 0;
}
