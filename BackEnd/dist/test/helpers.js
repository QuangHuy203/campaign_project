"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
exports.registerAndLogin = registerAndLogin;
exports.ensureRecipientsExist = ensureRecipientsExist;
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const knex_1 = require("../db/knex");
exports.app = (0, app_1.createApp)();
async function registerAndLogin() {
    const email = `user_${Date.now()}@example.com`;
    const password = 'password123';
    await (0, supertest_1.default)(exports.app).post('/auth/register').send({ email, name: 'Test User', password }).expect(201);
    const loginRes = await (0, supertest_1.default)(exports.app).post('/auth/login').send({ email, password }).expect(200);
    const token = loginRes.body?.data?.token;
    if (!token)
        throw new Error('Expected token in login response');
    return { token };
}
async function ensureRecipientsExist(recipients) {
    if (recipients.length === 0)
        return;
    await (0, knex_1.db)('recipients')
        .insert(recipients.map((recipient) => ({ email: recipient.email, name: recipient.name })))
        .onConflict('email')
        .merge(['name']);
}
