/** @format */

import fs from "fs"
import path from "path"
import { buildLibrary } from "./buildLibrary"
import { devLibrary } from "./devLibrary"

export interface Options {
  isDev: boolean
  isNode: boolean
  entryPoints: string[]
  clean: boolean
  external: {
    dependencies: boolean
    devDependencies: boolean
    peerDependencies: boolean
  }
  target: string
  format: "esm" | "cjs" | ("esm" | "cjs")[]
  devFormat: "esm" | "cjs"
  devConfig: string
  buildConfig: string
  define: { [key: string]: string }
  calculateSize: boolean
}

export async function lask(opts = {} as Partial<Options>) {
  const {
    isDev = false,
    isNode = false,
    entryPoints = ["src/index.ts"],
    clean = true,
    devConfig = "tsconfig.dev.json",
    buildConfig = "tsconfig.build.json",
    devFormat = "esm",
    format = ["cjs", "esm"],
    target = "es6",
    external = {
      dependencies: true,
      devDependencies: true,
      peerDependencies: true,
    },
    define = {
      "process.env.NODE_ENV": isDev ? '"development"' : '"production"',
    },
    calculateSize = true,
  } = opts

  const cwd = process.cwd()

  // Delete dist
  if (clean) {
    if (fs.existsSync(path.join(cwd, "dist"))) {
      fs.rmSync(path.join(cwd, "dist"), { recursive: true })
    }
  }

  // Collect externals from package
  const pkg = require(path.join(cwd, "package.json"))
  const externals = [
    ...(external.dependencies ? Object.keys(pkg.dependencies ?? {}) : []),
    ...(external.devDependencies ? Object.keys(pkg.devDependencies ?? {}) : []),
    ...(external.peerDependencies
      ? Object.keys(pkg.peerDependencies ?? {})
      : []),
  ]
  const outDirAbs = path.join(cwd, "dist")

  let configAbs = path.join(cwd, isDev ? devConfig : buildConfig)
  if (!fs.existsSync(configAbs)) {
    configAbs = path.join(cwd, "tsconfig.json")
  }

  const entryPointsAbs = entryPoints.map((entryPoint) =>
    path.join(cwd, entryPoint)
  )

  if (isDev) {
    return devLibrary({
      name: pkg.name,
      outdir: outDirAbs,
      tsconfig: configAbs,
      external: externals,
      format: devFormat,
      target,
      entryPoints: entryPointsAbs,
      isNode,
      define,
      calculateSize,
    })
  } else {
    return buildLibrary({
      name: pkg.name,
      outdir: outDirAbs,
      tsconfig: configAbs,
      external: externals,
      entryPoints: entryPointsAbs,
      format,
      target,
      isNode,
      define,
      calculateSize,
    })
  }
}
