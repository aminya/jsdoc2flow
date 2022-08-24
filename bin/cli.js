#!/usr/bin/env node

/* eslint-disable no-console */

import { readFileSync, mkdirsSync, readdirSync, lstatSync, copySync } from "fs-extra"
import { resolve, join, parse } from "path"
import { version, option, parse as _parse, opts, outputHelp } from "commander"
import { version as _version } from "../package.json"

version(_version)

function collect(val, list) {
  list.push(val)
  return list
}

option("-f, --file <file>", "The file to convert and output to stdout")
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

_parse(process.argv)
const options = opts()

options.ext = options.ext.map((e) => (e.startsWith(".") ? e : `.${e}`))

import Converter from "../src/index.js"
const converter = new Converter()

if (options.file) {
  const code = readFileSync(options.file).toString()
  const modifiedCode = converter.convertSourceCode(code)
  console.log(modifiedCode)
} else if ((options.inputDirectory && options.outputDirectory) || (options.inputDirectory && options.overwrite)) {
  const resolvedInputDir = resolve(options.inputDirectory)
  const outputDirectory = options.overwrite ? options.inputDirectory : options.outputDirectory
  const resolvedOutputDir = resolve(outputDirectory)

  mkdirsSync(resolvedOutputDir)
  const stack = [resolvedInputDir]
  while (stack.length) {
    const basePath = stack.pop()
    const entries = readdirSync(basePath)
    for (const entry of entries) {
      const entryPath = join(basePath, entry)
      const entryInfo = lstatSync(entryPath)
      const entryPathObj = parse(entryPath)
      if (entryInfo.isDirectory()) {
        stack.push(entryPath)
      } else {
        const newPath = join(outputDirectory, entryPath.replace(resolvedInputDir, ""))
        mkdirsSync(parse(newPath).dir)
        if (options.ext.includes(entryPathObj.ext)) {
          console.log(`Convert ${entryPath} to ${newPath}`)
          converter.convertFile(entryPath, newPath)
        } else {
          if (resolve(entryPath) !== resolve(newPath)) {
            console.log(`Copy ${entryPath} to ${newPath}`)
            copySync(entryPath, newPath, { overwrite: true })
          }
        }
      }
    }
  }
} else {
  console.log("Unkown cli parameters. Use the following options:")
  outputHelp()
}
