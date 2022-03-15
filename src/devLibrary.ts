/** @format */

import { build, Format } from 'esbuild'
import { spawn, ChildProcessWithoutNullStreams } from 'child_process'

export async function devLibrary({
  name,
  isNode,
  outdir,
  tsconfig,
  external,
  target,
  define,
  entryPoints,
}: {
  name: string
  outdir: string
  calculateSize: boolean
  entryPoints: string[]
  isNode: boolean
  tsconfig: string
  external: string[]
  format: 'esm' | 'cjs'
  target: string
  define: Record<string, string>
}) {
  const { log } = console

  log(`‣ ${name}: Starting watch mode`)

  const ts = spawn(`tsc`, [`-w`, `--project`, tsconfig, `--pretty`, `--preserveWatchOutput`])

  const errRegex = /error(.*)TS/g
  const cleanRegex = /Found 0 errors\./g

  let hasError = false

  ts.stdout.on('data', function (data: any) {
    const str = data.toString()
    if (errRegex.test(str)) {
      hasError = true
      log(`‣ ${name}: ${str}`)
    } else if (cleanRegex.test(str) && hasError) {
      log(`‣ ${name}: TypeScript errors fixed.`)
    }
  })

  try {
    log(`‣ ${name}: Starting incremental build`)

    const format = ['cjs', 'esm']

    // Build packages
    ;(Array.isArray(format) ? format : [format]).forEach((fmt) => {
      const extension = fmt === 'esm' ? '.mjs' : '.js'
      build({
        entryPoints,
        outdir,
        tsconfig,
        external,
        define,
        format: fmt as Format,
        target,
        platform: isNode ? 'node' : 'neutral',
        outExtension: { '.js': extension },
        minify: false,
        bundle: true,
        treeShaking: true,
        metafile: true,
        sourcemap: true,
        incremental: true,
        watch: {
          onRebuild(err) {
            if (err) {
              throw Error(`${name}: Rebuild failed`)
            }
            log(`✔ ${name}: Rebuilt package`)
          },
        },
      })
    })
  } catch (err) {
    ts?.kill()
    process.exit(1)
  }
}
