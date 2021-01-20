#!/usr/bin/env node

/* eslint-disable no-console */

"use strict"

const fs = require("fs-extra")
const path = require("path")
const program = require("commander")
const packageJson = require("../package.json")

program.version(packageJson.version)

function collect(val, list) {
  list.push(val)
  return list
}

program
  .option("-f, --file <file>", "The file to convert and output to stdout")
  .option("-i, --input-directory <dir>", "Source directory for original files")
  .option("-w, --overwrite", "Overwrite the original files")
  .option("-o, --output-directory <dir>", "Destination directory for converted files")
  .option(
    "--ext [ext]",
    "File extension to convert. Can specify multiple extensions. Defaults to 'js' only.",
    collect,
    ["js"]
  )
  .option("-v, --verbose", "Verbose output")

program.parse(process.argv)
const options = program.opts()

options.ext = options.ext.map((e) => (e.startsWith(".") ? e : "." + e))

let log = () => {}
if (options.verbose) {
  log = console.log
}

const Converter = require("../src")
const converter = new Converter()

if (options.file) {
  const code = fs.readFileSync(options.file).toString()
  const modifiedCode = converter.convertSourceCode(code)
  console.log(modifiedCode)
} else if ((options.inputDirectory && options.outputDirectory) || (options.inputDirectory && options.overwrite)) {
  const resolvedInputDir = path.resolve(options.inputDirectory)
  const outputDirectory = (options.overwrite) ? options.inputDirectory : options.outputDirectory
  const resolvedOutputDir = path.resolve(outputDirectory)

  fs.mkdirsSync(resolvedOutputDir)
  const stack = [resolvedInputDir]
  while (stack.length) {
    const basePath = stack.pop()
    const entries = fs.readdirSync(basePath)
    for (const entry of entries) {
      const entryPath = path.join(basePath, entry)
      const entryInfo = fs.lstatSync(entryPath)
      const entryPathObj = path.parse(entryPath)
      if (entryInfo.isDirectory()) {
        stack.push(entryPath)
      } else {
        const newPath = path.join(outputDirectory, entryPath.replace(resolvedInputDir, ""))
        fs.mkdirsSync(path.parse(newPath).dir)
        if (options.ext.includes(entryPathObj.ext)) {
          log(`Convert ${entryPath} to ${newPath}`)
          converter.convertFile(entryPath, newPath)
        } else {
          log(`Copy ${entryPath} to ${newPath}`)
          fs.copySync(entryPath, newPath, {overwrite: true})
        }
      }
    }
  }
} else {
  console.log("Unkown cli parameters. Use the following options:")
  program.outputHelp()
}
