/* eslint-disable-next-line import/no-unassigned-import */
require("should")
/* eslint-disable-next-line import/no-extraneous-dependencies */
const { format } = require("prettier")

const prettierOption = { semi: true, parser: "babel" }

function isCodeEqual(input, expected) {
  return format(input, prettierOption).should.be.eql(format(expected, prettierOption))
}

exports.isCodeEqual = isCodeEqual
