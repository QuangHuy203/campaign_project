"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).optional(),
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    DATABASE_URL: zod_1.z.string().min(1),
    TEST_DATABASE_URL: zod_1.z.string().min(1).optional(),
    JWT_SECRET: zod_1.z.string().min(16),
    AUTH_CRYPTO_KEY: zod_1.z.string().min(16).default('change_me_auth_crypto_secret'),
});
dotenv_1.default.config();
exports.env = envSchema.parse(process.env);
