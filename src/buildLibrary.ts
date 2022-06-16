import fs from 'fs'
import path from 'path'
import { buildSync } from 'esbuild'
import { gzip } from 'zlib'
import { spawn } from 'child_process'

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
  return new Promise<void>(async (resolve) => {
    const { log } = console
    try {
      let didBuild = false
      let didTypes = false

      function finish(types = false, build = false) {
        if (build) didBuild = true
        if (types) didTypes = true
        if (didBuild && didTypes) {
          log(`✔ ${name}: Build complete`)
          resolve()
        }
      }

      // Build types
      const ts = spawn(`tsc`, [`--project`, tsconfig, `--outDir`, outdir], { shell: true })

      ts.stdout.on('data', function (data: any) {
        const str = data.toString()
        log(`✔ ${name}: ${str}`)
      })

      ts.on('exit', () => {
        log(`✔ ${name}: Built types`)
        // Replace paths (if config / build config includes paths)
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
          const trp = spawn(`tsconfig-replace-paths`, [`-p`, cfgWithPaths], { shell: true })
          trp.on('exit', () => {
            log(`✔ ${name}: Resolved paths`)
            finish(true)
          })
        } else {
          finish(true)
        }
      })
      // Build packages
      await Promise.all(
        (Array.isArray(format) ? format : [format]).map((fmt) => {
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
      )

      finish(false, true)
    } catch (e) {
      log(`x ${name}: Build failed due to an error.`)
      // log(e)
    }
  })
}
