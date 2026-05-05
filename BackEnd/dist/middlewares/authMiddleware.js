"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const AppError_1 = require("../errors/AppError");
/** Auth boundary: require a valid Bearer token and attach `req.user` so downstream code can enforce "users only access their own data". */
function authMiddleware(req, _res, next) {
    const header = req.header('authorization') ?? req.header('Authorization');
    if (!header)
        return next((0, AppError_1.unauthorized)());
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token)
        return next((0, AppError_1.unauthorized)());
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        const id = Number(decoded.sub);
        if (!Number.isInteger(id) || id <= 0)
            return next((0, AppError_1.unauthorized)());
        req.user = { id };
        return next();
    }
    catch {
        return next((0, AppError_1.unauthorized)());
    }
}
