/** @format */

import { build, Format } from 'esbuild'
import { spawn } from 'child_process'

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

  log(`‣ ${name}: Using ${tsconfig}`)

  const ts = spawn(`tsc`, [
    `-w`,
    `--project`,
    tsconfig,
    `--pretty`,
    `--preserveWatchOutput`,
    `--removeComments`,
  ])

  const errRegex = /error(.*)TS/g

  ts.stdout.on('data', function (data: any) {
    const str = data.toString()
    if (errRegex.test(str)) {
      log(`‣ ${name}: ${str}`)
    }
  })

  try {
    log(`‣ ${name}: Starting watch mode`)

    const format = ['cjs', 'esm']

    // Build packages
    ;(Array.isArray(format) ? format : [format]).forEach((fmt) => {
      console.log('building', fmt)

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

// /** @format */

// import { build } from 'esbuild'
// import { exec } from 'child_process'

// export async function devLibrary({
//   name,
//   isNode,
//   outdir,
//   format,
//   tsconfig,
//   external,
//   target,
//   define,
//   entryPoints,
// }: {
//   name: string
//   outdir: string
//   calculateSize: boolean
//   entryPoints: string[]
//   isNode: boolean
//   tsconfig: string
//   external: string[]
//   format: 'esm' | 'cjs'
//   target: string
//   define: Record<string, string>
// }) {
//   const { log } = console

//   log(`‣ ${name}: Starting watch mode`)

//   const dir = exec('tsc -w -p ./tsconfig.dev.json', (err, stdout, stderr) => {
//     log(`✔ ${name}: Built types`)
//   })

//   try {
//     build({
//       entryPoints,
//       outdir,
//       tsconfig,
//       external,
//       format,
//       target,
//       platform: isNode ? 'node' : 'neutral',
//       outExtension: { '.js': '.mjs' },
//       minify: false,
//       bundle: true,
//       treeShaking: true,
//       metafile: true,
//       sourcemap: true,
//       incremental: true,
//       define,
//       watch: {
//         onRebuild(err) {
//           if (err) {
//             throw Error(`x ${name}: Rebuild failed`)
//           }
//           log(`✔ ${name}: Rebuilt package`)
//         },
//       },
//     })
//   } catch (err) {
//     dir.kill()
//     process.exit(1)
//   }
// }
