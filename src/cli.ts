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
  .option('-n, --node', 'Node')
  .parse(process.argv)

const cli = program as CLI

const { dev, node } = cli

const options = {} as Partial<Options>

try {
  const cwd = path.join(process.cwd())
  // Try to load a lask.config.json file
  const configPath = path.join(cwd, 'lask.config.json')
  if (fs.existsSync(configPath)) {
    const config = require(configPath)
    Object.assign(options, config)
  }

  Object.assign(options, {
    isNode: options.isNode ?? node ?? false,
    isDev: options.isDev ?? dev ?? false,
  })
} catch (e) {
  // No config, noop
}

lask(options)
