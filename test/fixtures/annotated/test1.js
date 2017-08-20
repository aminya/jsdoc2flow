// @flow
'use strict';

const Promise = require('bluebird');

const file2 = require('./file2.js');

/*::
type fnCallback = () => void;
*/
/**
 * @callback fnCallback
 */

/**
 * @param {number} a
 * @param {fnCallback} cb
 */
function gimmeCallback(a /*: number */, cb /*: fnCallback */) {
}

file2.add1(1);

/**
 * @returns {Promise<string>}
 */
function promiseMe() /*: Promise<string> */ {
    /*::
    type promiseMeCoroutine = () => void;
    */
    /**
     * @callback promiseMeCoroutine
     */
    /** @type {promiseMeCoroutine} */
    const fn = Promise.coroutine(function*() {
        return 1;
    });
    return fn();
}

module.exports.add1 = file2.add1;
