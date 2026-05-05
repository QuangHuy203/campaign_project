"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodePassword = decodePassword;
const crypto_1 = require("crypto");
const env_1 = require("../config/env");
const AppError_1 = require("../errors/AppError");
const ENCRYPTED_PREFIX = 'enc:v1:';
function getKey() {
    return (0, crypto_1.createHash)('sha256').update(env_1.env.AUTH_CRYPTO_KEY).digest();
}
function decodePassword(input) {
    if (!input.startsWith(ENCRYPTED_PREFIX)) {
        return input;
    }
    const payload = input.slice(ENCRYPTED_PREFIX.length);
    const [ivBase64, encryptedBase64] = payload.split(':');
    if (!ivBase64 || !encryptedBase64) {
        throw (0, AppError_1.badRequest)('Invalid encrypted password payload');
    }
    const iv = Buffer.from(ivBase64, 'base64');
    const encrypted = Buffer.from(encryptedBase64, 'base64');
    if (encrypted.length < 17) {
        throw (0, AppError_1.badRequest)('Invalid encrypted password payload');
    }
    const authTag = encrypted.subarray(encrypted.length - 16);
    const cipherText = encrypted.subarray(0, encrypted.length - 16);
    try {
        const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', getKey(), iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(cipherText), decipher.final()]);
        return decrypted.toString('utf8');
    }
    catch {
        throw (0, AppError_1.badRequest)('Invalid encrypted password payload');
    }
}
