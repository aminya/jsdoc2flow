/* eslint-disable-next-line import/no-unassigned-import */
import "should"
/* eslint-disable-next-line import/no-extraneous-dependencies */
import { format } from "prettier"

const prettierOption = { semi: true, parser: "babel" }

function isCodeEqual(input, expected) {
  return format(input, prettierOption).should.be.eql(format(expected, prettierOption))
}

const _isCodeEqual = isCodeEqual
export { _isCodeEqual as isCodeEqual }
