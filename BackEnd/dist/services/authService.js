"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const AppError_1 = require("../errors/AppError");
const knex_1 = require("../db/knex");
const userRepo_1 = require("../repos/userRepo");
const passwordCrypto_1 = require("../utils/passwordCrypto");
/** Registration is the identity-creation step: store only a one-way password hash and reject duplicate emails so a login uniquely identifies one person. */
async function registerUser(args) {
    const plainPassword = (0, passwordCrypto_1.decodePassword)(args.password);
    if (plainPassword.length < 8 || plainPassword.length > 200) {
        throw (0, AppError_1.badRequest)('Password must be between 8 and 200 characters');
    }
    const passwordHash = await bcryptjs_1.default.hash(plainPassword, 10);
    try {
        const user = await (0, userRepo_1.insertUser)(knex_1.db, { email: args.email, name: args.name, passwordHash });
        return user;
    }
    catch (e) {
        const pgErr = e;
        if (pgErr.code === '23505') {
            throw (0, AppError_1.conflict)('Email already exists');
        }
        throw e;
    }
}
/** Login returns an access token (not user secrets) so clients can authenticate subsequent requests without ever receiving/storing the password. */
async function loginUser(args) {
    const user = await (0, userRepo_1.findUserByEmail)(knex_1.db, args.email);
    if (!user)
        throw (0, AppError_1.unauthorized)('Invalid credentials');
    const plainPassword = (0, passwordCrypto_1.decodePassword)(args.password);
    const ok = await bcryptjs_1.default.compare(plainPassword, user.password_hash);
    if (!ok)
        throw (0, AppError_1.unauthorized)('Invalid credentials');
    const token = jsonwebtoken_1.default.sign({ sub: String(user.id) }, env_1.env.JWT_SECRET, { expiresIn: '1h' });
    return { token };
}
