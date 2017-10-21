/* @flow */

/**
 * A simple class
 *
 * @property {string} prop1
 * @property {number} prop2
 */
class MyClass {
/*::
prop1: string;
prop2: number;
*/

    /**
     * @constructs
     * @param {string} prop1
     * @param {?number} prop2
     */
    constructor(prop1 /*: string */, prop2 /*: ?number */ = 0) {
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
function justThrow(whatever /*: any */, tuples /*: ?Array<Array<string>> */) /*: void */ {
    throw new Error(`it throws: ${tuples.join('|')}` );
}


/*::
type Secret = {
  hash: string,
  salt: string
};
*/
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
function compare(str /*: string */, { hash, salt } /*: Secret */) /*: boolean */ {
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
function compare2(str /*: string */, { hash, salt } /*: { hash: string, salt: string } */) /*: boolean */ {
    return str === hash + salt;
}


/**
 * Verify something to a 3rd-party
 *
 * @param {string} smth
 * @returns {Promise.<boolean>}
 */
async function verify(smth /*: string */) /*: Promise<boolean> */ {
    const res = await request(() => smth);

    return res.value > 0;
}
