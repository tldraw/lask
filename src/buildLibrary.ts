/** @format */

import fs from 'fs'
import path from 'path'
import { buildSync } from 'esbuild'
import { gzip } from 'zlib'
import { exec } from 'child_process'

export function buildLibrary({
  name,
  isNode,
  outdir,
  tsconfig,
  external,
  format,
  target,
  define,
  entryPoints,
  calculateSize,
}: {
  name: string
  outdir: string
  calculateSize: boolean
  entryPoints: string[]
  isNode: boolean
  format: 'esm' | 'cjs' | ('esm' | 'cjs')[]
  target: string
  tsconfig: string
  external: string[]
  define: Record<string, string>
}) {
  const { log } = console
  try {
    // Build types
    const dir = exec(`tsc -p ${tsconfig} --outDir ${outdir}`, () => {
      log(`✔ ${name}: Built types`)
    })

    // Replace paths (if config / build config includes paths)
    dir.on('exit', () => {
      const base_cfg = require(path.join(process.cwd(), 'tsconfig.json'))
      let cfgWithPaths = ''
      if (base_cfg?.compilerOptions?.paths) {
        cfgWithPaths = 'tsconfig.json'
      } else {
        const cfg = require(tsconfig)
        if (cfg?.compilerOptions?.paths) {
          cfgWithPaths = tsconfig
        }
      }
      if (cfgWithPaths) {
        exec(`tsconfig-replace-paths -p ${cfgWithPaths}`, () => {
          log(`✔ ${name}: Resolved paths`)
        })
      }
    })
    // Build packages
    ;(Array.isArray(format) ? format : [format]).forEach((fmt) => {
      const extension = fmt === 'esm' ? '.mjs' : '.js'
      const buildResult = buildSync({
        entryPoints,
        outdir,
        tsconfig,
        external,
        define,
        format: fmt,
        platform: isNode ? 'node' : 'neutral',
        outExtension: { '.js': extension },
        bundle: true,
        metafile: true,
        minify: false,
        sourcemap: true,
        treeShaking: true,
        target,
      })

      if (calculateSize) {
        // Calculate the size of the output esm module (standard and zipped)
        fs.readFile(path.join(outdir, `index${extension}`), (_err, data) => {
          gzip(data, (_err, result) => {
            const size = Object.values(buildResult.metafile!.outputs).reduce(
              (acc, { bytes }) => acc + bytes,
              0
            )
            log(
              `✔ ${name}: Built ${fmt} package (${(size / 1000).toFixed(1)}kb / ${(
                result.length / 1000
              ).toFixed(1)}kb gzipped)`
            )
          })
        })
      }
    })
  } catch (e) {
    log(`x ${name}: Build failed due to an error.`)
    log(e)
  }
}
