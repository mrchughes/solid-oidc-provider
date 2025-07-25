module.exports = {
    testEnvironment: 'node',
    testMatch: [
        '**/test/**/*.test.js'
    ],
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/index.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
        'text',
        'lcov'
    ],
    verbose: true,
    moduleNameMapper: {
        "^oidc-provider$": "<rootDir>/test/mocks/oidc-provider.js"
    }
};
