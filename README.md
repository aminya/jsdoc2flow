# jsdoc2flow

Convert JSDoc comments into Flow/Typescript annotations

![CI](https://github.com/dannysu/jsdoc2flow/workflows/CI/badge.svg)

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
function getResult(count) {}
```

into:

```javascript
type Result = {
  id: string,
  count: number,
}

/**
 * @typedef {object} Result
 * @property {string} id
 * @property {number} count
 */

/**
 * @param {number} count
 * @returns {Result}
 */
function getResult(count: number): Result {}
```

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

Update the files in place:

```
> jsdoc2flow -i path/to/input/dir --overwrite
```

Convert a single file and output to stdout:

```
> jsdoc2flow -f path/to/file.js
```

Convert a directory of files and output to a new location:

```
> jsdoc2flow -i path/to/input/dir -o path/to/output/dir
```

All options:

```
Usage: cli [options]

Options:
  -V, --version                 output the version number
  -f, --file <file>             The file to convert and output to stdout
  -i, --input-directory <dir>   Source directory for original files
  -w, --overwrite               Overwrite the original files
  -o, --output-directory <dir>  Destination directory for converted files
  --ext [ext]                   File extension to convert. Can specify multiple extensions. Defaults to 'js' only.
                                (default: ["js"])
  -v, --verbose                 Verbose output
  -h, --help                    display help for command
```

After conversion to Flow, you can convert your code to TypeScript using [`@khanacademy/flow-to-ts`](https://www.npmjs.com/package/@khanacademy/flow-to-ts)

## API

```js
const Converter = require("jsdoc2flow")
const converter = new Converter(opts)

converter.convertSourceCode(code)
converter.convertFile(src, dst)
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

```js
/** @typedef {number} MyNumber */
```

- Custom Object

```js
/**
 * @typedef {object} MyObject
 * @property {string} str
 * @property {number} num
 */
```

For callback and functions, you can use `@callback`:

```js
/**
 * @callback MyCallback
 * @param {number} arg1
 * @returns {number}
 */
```

## @type Annotation

```js
/** @type {number} */
const count = 1;
/** @type {MyObject} */
const obj;
```

## Inspiration

This is inspired by [flow-jsdoc](https://github.com/Kegsay/flow-jsdoc), but is a totally separate implementation of the same idea. This uses the [Espree](https://github.com/eslint/espree) parser instead and implements some of the things flow-jsdoc is missing.
