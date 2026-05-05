"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    setupFiles: ['<rootDir>/src/test/env.ts'],
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
exports.default = config;
