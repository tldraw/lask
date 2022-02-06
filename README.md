<!-- @format -->

# lask

`lask` is a build tool for TypeScript libraries. It uses esbuild to build and bundle code and tsc to generate types. It is pretty opinionated. You might use it as a reference for building your own mini build tool.

## Installation

```bash
npm install lask --dev
```

or

```bash
yarn add lask --dev
```

## Usage

- Install `lask` to your project's `devDependencies`.
- Run `yarn lask` to build your project, or `yarn lask -d` to start your project in development mode.

If you like what you get, add `lask` to your `package.json`'s `scripts` section:

```json
{
  "scripts": {
    "build": "lask",
    "dev": "lask -d",
    "test": "lask test"
  }
}
```

### Configuration

By default, `lask` expects your root directory to have:

- source code in the `src` directory
- output in the `dist` directory
- a `tsconfig.json` file in the root directory
- a `tsconfig.dev.json` file in the root directory
- a `tsconfig.build.json` file in the root directory
- a `package.json` with the following fields:

You can configure `lask` by creating a `lask.config.json` (sorry) in your project's root directory.

This config can include some or all of the following properties:

```ts
interface Options {
  isDev: boolean
  isNode: boolean
  entryPoints: string[]
  outDir: string
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
```

For example:

```json
{
  "isNode": true,
  "entryPoints": ["./src/index.ts"],
  "clean": true,
  "outDir": "dist",
  "external": {
    "dependencies": true,
    "devDependencies": true,
    "peerDependencies": true
  },
  "devConfig": "tsconfig.dev.json",
  "buildConfig": "tsconfig.build.json",
  "format": ["cjs", "esm"],
  "calculateSize": true
}
```

### `isNode`

Whether to build / develop for node, rather than neutral JavaScript.

### `outDir`

Where to place the output files. By default, this is `dist`. This means that your `package.json` should look like:

```json
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "source": "./src/index.ts",
```

If you set a different value for `outDir`, be sure to also update those fields in your `package.json`.

### `buildConfig`

The location of the `tsconfig` file to use for `lask`. Defaults to `tsconfig.build.json`.

### `devConfig`

The location of the `tsconfig` file to use for `lask -d`. Defaults to `tsconfig.dev.json`.

### `clean`

Whether to remove the `dist` folder before building. Defaults to `true`.

### `external`

By default, all three options here are set to `true`, which means that `lask` will **exclude** all dependencies / peerDependencies / devDependencies from the bundled output.

#### `define`

Passed to esbuild's `define` option. By default, `define` is set to either `{ "process.env.NODE_ENV": "production" }` or `{ "process.env.NODE_ENV": "development" }` depending on the `isDev` option.

### `format`

Whether to build to `"esm"`, `"cjs"`, or `["cjs", "esm"]`. Defaults to `["cjs", "esm"]`.

### `calculateSize`

Whether to calculate the size of the output for each format. Defaults to `true`.

## License

This project is MIT licensed.

## Author

- Steve Ruiz ([Github](https://github.com/steveruizok) / [Twitter](https://twitter.com/steveruizok))
