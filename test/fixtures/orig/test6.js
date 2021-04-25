/** Get the type of the given path
 * @param {string} filepath absolute path
 * @returns {Promise<PATH_TYPE>}
 */
async function getPathType(filepath) {
  let pathStat
  try {
    pathStat = await stat(filepath)
  } catch (error) {
    return PATH_TYPE.OTHER
  }
  if (pathStat.isDirectory()) {
    return PATH_TYPE.DIRECTORY
  } else if (pathStat.isFile()) {
    return PATH_TYPE.FILE
  }
  return PATH_TYPE.OTHER
}
