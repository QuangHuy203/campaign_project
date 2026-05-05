"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCampaignsByUser = listCampaignsByUser;
exports.insertCampaign = insertCampaign;
exports.findCampaignByIdForUser = findCampaignByIdForUser;
exports.updateDraftCampaign = updateDraftCampaign;
exports.deleteDraftCampaign = deleteDraftCampaign;
exports.scheduleCampaign = scheduleCampaign;
exports.hasSchedulingConflict = hasSchedulingConflict;
exports.markCampaignSent = markCampaignSent;
async function listCampaignsByUser(db, userId) {
    return db('campaigns')
        .where({ created_by: userId })
        .orderBy('created_at', 'desc');
}
/** New campaigns start as drafts so content and recipients can be refined before scheduling/sending. */
async function insertCampaign(db, args) {
    const rows = await db('campaigns')
        .insert({
        name: args.name,
        subject: args.subject,
        body: args.body,
        created_by: args.createdBy,
        status: 'draft',
        scheduled_at: null,
    })
        .returning('*');
    return rows[0];
}
async function findCampaignByIdForUser(db, args) {
    const row = await db('campaigns')
        .where({ id: args.id, created_by: args.userId })
        .first();
    return row ?? null;
}
/** Editing is restricted to drafts; once scheduled/sent, content is treated as immutable for audit/reporting consistency. */
async function updateDraftCampaign(db, args) {
    const rows = await db('campaigns')
        .where({ id: args.id, created_by: args.userId, status: 'draft' })
        .update(args.patch)
        .returning('*');
    return rows[0] ?? null;
}
/** Only drafts can be deleted to avoid removing historical records for scheduled/sent outreach. */
async function deleteDraftCampaign(db, args) {
    const rows = await db('campaigns')
        .where({ id: args.id, created_by: args.userId, status: 'draft' })
        .delete()
        .returning(['id']);
    return rows.length;
}
/** Scheduling is a reversible pre-send state; sent campaigns cannot be rescheduled. */
async function scheduleCampaign(db, args) {
    const rows = await db('campaigns')
        .where({ id: args.id, created_by: args.userId })
        .whereNot({ status: 'sent' })
        .update({ status: 'scheduled', scheduled_at: args.scheduledAt })
        .returning('*');
    return rows[0] ?? null;
}
async function hasSchedulingConflict(db, args) {
    const row = await db('campaigns')
        .where({ created_by: args.userId, status: 'scheduled' })
        .whereNot({ id: args.campaignId })
        .where({ scheduled_at: args.scheduledAt })
        .first('id');
    return Boolean(row);
}
/** Marking sent is one-way; downstream analytics assume "sent" never flips back to draft/scheduled. */
async function markCampaignSent(db, args) {
    const rows = await db('campaigns')
        .where({ id: args.id, created_by: args.userId })
        .whereNot({ status: 'sent' })
        .update({ status: 'sent' })
        .returning('*');
    return rows[0] ?? null;
}
