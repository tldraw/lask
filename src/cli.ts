#!/usr/bin/env node
/** @format */

import path from 'path'
import fs from 'fs'
import program, { Command } from 'commander'
import { lask } from './lask'
import type { Options } from './lask'

interface CLI extends Command {
  dev?: boolean
  node?: boolean
}

program
  .version('0.0.0')
  .option('-d, --dev', 'Develop')
  .option('-n, --node', 'Develop Node')
  .parse(process.argv)

const cli = program as CLI

const { dev = false, node = false } = cli

const options = {} as Partial<Options>

try {
  const cwd = path.join(process.cwd())
  // Try to load a lask.config.json file
  const configPath = path.join(cwd, 'lask.config.json')
  if (fs.existsSync(configPath)) {
    const config = require(configPath)
    Object.assign(options, config)
  }
} catch (e) {
  // No config, noop
} finally {
  // Command line should override config
  Object.assign(options, {
    isNode: node,
    isDev: dev,
  })
}

lask(options)
