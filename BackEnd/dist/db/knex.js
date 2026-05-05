"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const knex_1 = __importDefault(require("knex"));
const env_1 = require("../config/env");
const connectionString = process.env.NODE_ENV === 'test' ? env_1.env.TEST_DATABASE_URL ?? env_1.env.DATABASE_URL : env_1.env.DATABASE_URL;
exports.db = (0, knex_1.default)({
    client: 'pg',
    connection: connectionString,
    pool: { min: 0, max: 10 },
    debug: true,
});
