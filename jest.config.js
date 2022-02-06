/** @format */

module.exports = {
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.(tsx|jsx|ts|js|mjs)?$": [
      "@swc-node/jest",
      {
        dynamicImport: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    ],
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  modulePathIgnorePatterns: [
    "<rootDir>/test/__fixtures__",
    "<rootDir>/node_modules",
    "<rootDir>/dist",
  ],
  collectCoverageFrom: ["<rootDir>src/**/*.ts"],
}
