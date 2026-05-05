"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRecipientsByEmails = findRecipientsByEmails;
exports.upsertRecipientsByEmail = upsertRecipientsByEmail;
async function findRecipientsByEmails(db, emails) {
    if (emails.length === 0)
        return [];
    const uniqueEmails = Array.from(new Set(emails.map((email) => email.trim().toLowerCase())));
    const rows = await db('recipients')
        .whereIn('email', uniqueEmails)
        .select(['id', 'email', 'name', 'created_at']);
    return rows;
}
/** Canonicalize recipients by email so repeated campaign uploads don’t create duplicates and engagement stats stay attributable to one recipient identity. */
async function upsertRecipientsByEmail(db, recipients) {
    if (recipients.length === 0)
        return [];
    const rows = await db('recipients')
        .insert(recipients.map((r) => ({ email: r.email, name: r.name })))
        .onConflict('email')
        .merge(['name'])
        .returning(['id', 'email', 'name', 'created_at']);
    return rows;
}
