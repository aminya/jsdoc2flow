We cannot use Pure ESM packages (e.g. `estree-util-attach-comments`) because:

- Node doesn't support mixing `require` and `import`.
- Some people are shipping pure ESM without properly fixing Node.

This means we should regress to the old days of `vendor` folders.

See these for more information:

https://github.com/wooorm/estree-util-attach-comments/issues/2
https://github.com/unifiedjs/unified/issues/121
https://github.com/sindresorhus/meta/discussions/15
https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
