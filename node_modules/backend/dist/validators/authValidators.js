"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email().max(320).transform((s) => s.trim().toLowerCase()),
    name: zod_1.z.string().min(1).max(200).transform((s) => s.trim()),
    password: zod_1.z.string().min(1).max(2000),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email().max(320).transform((s) => s.trim().toLowerCase()),
    password: zod_1.z.string().min(1).max(2000),
});
