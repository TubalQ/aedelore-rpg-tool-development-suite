// Test setup file
// This runs before each test file

// Increase timeout for database operations
jest.setTimeout(10000);

// Suppress console logs during tests (optional - comment out for debugging)
// global.console = {
//     ...console,
//     log: jest.fn(),
//     error: jest.fn(),
//     warn: jest.fn(),
// };
