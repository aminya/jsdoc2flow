import path from "path"

/** Converts given path to Posix (replacing \\ with /)
 * @param {string} givenPath   Path to convert
 * @returns {string}          Converted filepath
 */
export function posixifyPath(givenPath: string): string {
  return path.normalize(givenPath).replace(/\\/g, "/")
}

/** Converts given path to Posix (replacing \\ with /) and removing ending slashes
 * @param {string} givenPath   Path to convert
 * @returns {string}          Converted filepath
 */
export default function posixifyPathNormalized(givenPath: string): string {
  return posixifyPath(givenPath).replace(/\/$/, "")
}
