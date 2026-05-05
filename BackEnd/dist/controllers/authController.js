"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
const authValidators_1 = require("../validators/authValidators");
const authService_1 = require("../services/authService");
/** Public entrypoint for account creation; validation happens here, business rules live in the service. */
async function register(req, res) {
    const body = authValidators_1.registerSchema.parse(req.body);
    const user = await (0, authService_1.registerUser)(body);
    return res.status(201).json({ data: user });
}
/** Public entrypoint for session creation; response returns a token only (no password or hash). */
async function login(req, res) {
    const body = authValidators_1.loginSchema.parse(req.body);
    const result = await (0, authService_1.loginUser)(body);
    return res.status(200).json({ data: result });
}
/** Logout invalidates the current client session state; token revocation is handled client-side because JWTs are stateless. */
async function logout(_req, res) {
    return res.status(204).send();
}
