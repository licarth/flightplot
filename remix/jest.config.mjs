import hq from 'alias-hq';

const config = {
    moduleDirectories: ['node_modules', '<rootDir>/'],
    // testEnvironment: './jest-environment-jsdom',
    testEnvironment: './custom-test-env.js',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testMatch: ['**/?(*.)+(spec|test).(js|ts)?(x)'],
    transformIgnorePatterns: [
        '/node_modules/(?!@firebase|firebase|node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill|react-leaflet|@react-leaflet/core|react-notion-x|notion-utils|p-queue|p-timeout|is-url-superb|mem|mimic-fn|normalize-url|@marfle)',
    ],
    transform: {
        '^.+\\.js$': ['esbuild-jest'],
        '^.+\\.tsx?$': [
            'esbuild-jest',
            {
                sourcemap: true,
                loaders: {
                    '.test.ts': 'tsx',
                },
            },
        ],
    },
    moduleNameMapper: { ...hq.get('jest'), '^.+\\.(css|less)$': '<rootDir>/CSSStub.js' },
};
export default config;
