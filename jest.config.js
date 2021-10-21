// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    clearMocks: true,
    coverageDirectory: "coverage",
    testEnvironment: "node",
    testMatch: [
      "**/?(*.)+(spec|test).[t]s?(x)"
    ],
    transformIgnorePatterns: ['^.+\\.js$'],

    preset: 'ts-jest',
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
  };
