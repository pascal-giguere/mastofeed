export default {
  roots: ['<rootDir>', '<rootDir>/../../src'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'test/tsconfig.json',
        diagnostics: false,
      },
    ],
  },
  testEnvironment: 'node',
};
