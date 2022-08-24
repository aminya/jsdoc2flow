// @flow

const Promise = require("bluebird")

const file2 = require("./file2.js")

/**
 * @callback fnCallback
 */

/**
 * @param {number} a
 * @param {fnCallback} cb
 */
function gimmeCallback(a, cb) {}

file2.add1(1)

/**
 * @returns {Promise<string>}
 */
function promiseMe() {
  /**
   * @callback promiseMeCoroutine
   */
  /** @type {promiseMeCoroutine} */
  const fn = Promise.coroutine(function* () {
    return 1
  })
  return fn()
}

module.exports.add1 = file2.add1
