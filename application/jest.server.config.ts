import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.server.setup.ts'],
  testMatch: [
    '<rootDir>/src/api-tests/**/*.test.ts',
    // Keep server suite focused; legacy server tests can be re-enabled once updated.
  ],
  testPathIgnorePatterns: [
    // Keep legacy app/api tests out of CI for now. New route tests live in src/api-tests.
    '<rootDir>/src/app/api/',
    '/node_modules/',
  ],
  moduleNameMapper: {
    '^lib/(.*)$': '<rootDir>/src/lib/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1',
    '^settings$': '<rootDir>/src/settings',
  },
});
