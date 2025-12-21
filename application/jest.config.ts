import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '@testing-library/jest-dom'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx?|jsx?)$',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^lib/(.*)$': '<rootDir>/src/lib/$1',
    '^settings$': '<rootDir>/src/settings',
  },
  transformIgnorePatterns: ['/node_modules/(?!next-auth|@auth/core).+\\.js$'],
  testPathIgnorePatterns: [
    '<rootDir>/src/lib/',
    '<rootDir>/src/services/',
    // Ignore older /app/api tests that rely on NextRequest/Request polyfills and legacy module resolution.
    // Module 1 API tests live in `src/api-tests/**` and are included.
    '<rootDir>/src/app/api/',
    // Route-handler unit tests run in `test:server` (node env).
    '<rootDir>/src/api-tests/',
    '<rootDir>/src/middleware.test.ts',
    '/node_modules/',
  ],

  // Note: keep a single Jest project. `next/jest` sets up transforms for TS/TSX;
  // Jest multi-project mode bypasses parts of that setup and breaks TSX parsing.

  // Rely on `testRegex` (compatible with next/jest defaults) instead of `testMatch`.
};

export default createJestConfig(customJestConfig);
