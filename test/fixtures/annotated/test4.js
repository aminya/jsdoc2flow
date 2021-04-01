/**
 * Draws lines on the corresponding layer.
 *
 * The lines range to draw is specified by the `firstRow` and `lastRow`
 * parameters.
 *
 * @param  {number} firstRow the first row to render
 * @param  {number} lastRow the last row to render
 * @param  {number} offsetRow the relative offset to apply to rows when
 *                            rendering them
 * @param {number} lineHeight  this.minimap.getLineHeight() * devicePixelRatio
 * @param {number} charHeight  this.minimap.getCharHeight() * devicePixelRatio
 * @param {number} charWidth  this.minimap.getCharWidth() * devicePixelRatio
 * @param {number} canvasWidth  this.tokensLayer.getSize().width
 * @param {CanvasRenderingContext2D} context this.tokensLayer.context
 * @param {TextEditor} editor this.minimap.getTextEditor()
 * @param {number} editorScreenLineCount
 * @param {RegExp} invisibleRegExp
 * @param {(t: Token) => string} getTokenColorClosure
 * @param {boolean} ignoreWhitespacesInTokens this.ignoreWhitespacesInTokens
 * @param {number} maxTokensInOneLine this.maxTokensInOneLine
 * @access private
 */
function drawLines(
  firstRow: number,
  lastRow: number,
  offsetRow: number,
  lineHeight: number,
  charHeight: number,
  charWidth: number,
  canvasWidth: number,
  context: CanvasRenderingContext2D,
  editor: TextEditor,
  editorScreenLineCount: number,
  invisibleRegExp: RegExp,
  getTokenColorClosure: (t: Token) => string,
  ignoreWhitespacesInTokens: boolean,
  maxTokensInOneLine: number
) {
  console.log("x")
}
