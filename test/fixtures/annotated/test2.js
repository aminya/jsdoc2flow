'use strict';

const e = exports;

/**
 * Function 1
 *
 * @param {object} obj
 * @param {string} obj.a
 * @param {string} obj.b
 * @param {object} obj.c
 * @param {object=} obj.d
 * @param {object=} obj.e
 * @returns {number}
 */
e.fn1 = ({a, b, c, d, e}: { a: string, b: string, c: {}, d?: ?{}, e?: ?{} }) : number => {
};

/**
 * Function 2
 *
 * @param {object} obj
 * @param {string} obj.a
 * @param {string} obj.b
 * @param {object} obj.c
 * @param {object=} obj.d
 * @param {object=} obj.e
 * @returns {number}
 */
e.fn2 = ({a, b, c, d, e}: { a: string, b: string, c: {}, d?: ?{}, e?: ?{} }) : number => {
};

/**
 * Function 3
 *
 * @param {object} obj
 * @param {string} obj.a
 * @param {string} obj.b
 * @param {object=} obj.c
 * @param {object=} obj.d
 * @returns {number}
 */
e.fn3 = ({a, b, c, d} : { a: string, b: string, c?: ?{}, d?: ?{} }) : number => {
};
