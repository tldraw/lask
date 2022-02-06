#!/usr/bin/env node
/** @format */

import path from "path"
import program, { Command } from "commander"
import { lask } from "./lask"
import type { Options } from "./lask"

interface CLI extends Command {
  dev?: boolean
  node?: boolean
}

program
  .version("0.0.0")
  .option("-d, --dev", "Develop")
  .option("-n, --node", "Develop Node")
  .parse(process.argv)

const cli = program as CLI

const { dev = false, node = false } = cli

const options: Partial<Options> = {
  isNode: node,
  isDev: dev,
}

try {
  const config = require(path.join(process.cwd(), "lask.config.json"))
  Object.assign(options, config)
  console.log(options)
} catch (e) {
  console.log("no config")
}

lask(options)
