# jsdoc2flow

This is a library and CLI tool that reads [JSDoc](http://usejsdoc.org) comments and inserts the corresponding [Flow](https://flowtype.org/) annotations.

For example, it turns the following code
```javascript
/**
 * @typedef {object} Result
 * @property {string} id
 * @property {number} count
 */

/**
 * @param {number} count
 * @returns {Result}
 */
function getResult(count) {
}
```
into:
```javascript
/*::
type Result = {
  id: string,
  count: number
};
*/
/**
 * @typedef {object} Result
 * @property {string} id
 * @property {number} count
 */

/**
 * @param {number} count
 * @returns {Result}
 */
function getResult(count /*: number */) /*: Result */ {
}
```

## Benefits
- No need to transpile but still get the benefits of type checking
- Compatibility with IDEs such as WebStorm
  - Currently WebStorm doesn't support [Flow comment syntax](https://flowtype.org/blog/2015/02/20/Flow-Comments.html), so it's either transpile or nothing
- Benefit from existing JSDoc comments

## Inspiration
This is inspired by [flow-jsdoc](https://github.com/Kegsay/flow-jsdoc), but is a totally separate implementation of the same idea. This uses the [Espree](https://github.com/eslint/espree) parser instead and implements some of the things flow-jsdoc is missing.

# Usage

Note that you still need to add `// @flow` yourself to the top of the files to be checked by Flow.

## Install

Globally:
```
> npm install -g jsdoc2flow
```

Within a project:
```
> npm install --save-dev jsdoc2flow
```

## CLI
Convert a single file and output to stdout:
```
> jsdoc2flow -f path/to/file.js
```

Convert a directory of files and output to a new location:
```
> jsdoc2flow -i path/to/input/dir -o path/to/output/dir
```

## Code
```javascript
const Converter = require("jsdoc2flow");
const converter = new Converter(opts);

converter.convertSourceCode(code);
converter.convertFile(src, dst);
```

# Implemented Features

See the `test` directory for detailed list of validated cases.

## Annotate Functions

You can document `@param` and `@returns` for functions in any of the following style:
- `function test(a) {}`
- `Something.prototype.test = function(a) {};`
- `const test = function(a) {};`
- `const obj = { test: function(a) {} };`
- `const test = (a) => {};`
- `const test = a => {};`
- `class Test { test(a) {} }`

## Custom Types

You can document using `@typedef` to define custom types:
- Alias
```
/**
 * @typedef {number} MyNumber
 */
```
- Custom Object
```
/**
 * @typedef {object} MyObject
 * @property {string} str
 * @property {number} num
 */
```

For callback and functions, you can use `@callback`:
```
/**
 * @callback MyCallback
 * @param {number} arg1
 * @returns {number}
 */
```

## @type Annotation
```
/** @type {number} */
const count = 1;
/** @type {MyObject} */
const obj;
```
