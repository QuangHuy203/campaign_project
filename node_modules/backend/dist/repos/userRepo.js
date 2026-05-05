"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertUser = insertUser;
exports.findUserByEmail = findUserByEmail;
async function insertUser(db, args) {
    const rows = await db('users')
        .insert({
        email: args.email,
        name: args.name,
        password_hash: args.passwordHash,
    })
        .returning(['id', 'email', 'name', 'created_at']);
    return rows[0];
}
async function findUserByEmail(db, email) {
    const row = await db('users').where({ email }).first();
    return row ?? null;
}
