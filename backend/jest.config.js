/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests-dist'],
  testMatch: ['**/*.test.js'],
  moduleNameMapper: {
    '^@dist/(.*)$': '<rootDir>/dist/$1',
    '^@generated-prisma$': '<rootDir>/prisma/generated',
  },
  clearMocks: true,
  collectCoverageFrom: ['dist/**/*.js', '!dist/**/*.d.ts'],
  testTimeout: 15000,
};
