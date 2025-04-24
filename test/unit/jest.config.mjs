export default {
  roots: ["<rootDir>", "<rootDir>/../../src"],
  testMatch: ["**/*.test.mts"],
  moduleFileExtensions: ["ts", "mts", "js", "mjs", "json"],
  extensionsToTreatAsEsm: [".mts"],
  transform: {
    "^.+\\.m?ts?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "test/tsconfig.json",
        diagnostics: false,
      },
    ],
  },
  testEnvironment: "node",
  resolver: "ts-jest-resolver",
};
