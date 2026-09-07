module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/core/**/*.test.ts'],
  modulePathIgnorePatterns: ['<rootDir>/app/'],
};
