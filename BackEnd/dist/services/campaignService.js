"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCampaigns = listCampaigns;
exports.createCampaign = createCampaign;
exports.getCampaignDetails = getCampaignDetails;
exports.updateCampaignDraft = updateCampaignDraft;
exports.deleteCampaignDraft = deleteCampaignDraft;
exports.scheduleCampaignAt = scheduleCampaignAt;
exports.sendCampaign = sendCampaign;
exports.getCampaignStats = getCampaignStats;
const knex_1 = require("../db/knex");
const AppError_1 = require("../errors/AppError");
const campaignRepo_1 = require("../repos/campaignRepo");
const campaignRecipientRepo_1 = require("../repos/campaignRecipientRepo");
const recipientRepo_1 = require("../repos/recipientRepo");
function computeRates(counts) {
    const open_rate = counts.sent === 0 ? 0 : counts.opened / counts.sent;
    const send_rate = counts.total === 0 ? 0 : counts.sent / counts.total;
    return { ...counts, open_rate, send_rate };
}
async function listCampaigns(userId) {
    return (0, campaignRepo_1.listCampaignsByUser)(knex_1.db, userId);
}
async function createCampaign(args) {
    return knex_1.db.transaction(async (trx) => {
        const requestedEmails = args.recipients.map((recipient) => recipient.email.trim().toLowerCase());
        const existingRecipients = await (0, recipientRepo_1.findRecipientsByEmails)(trx, requestedEmails);
        const existingEmailSet = new Set(existingRecipients.map((recipient) => recipient.email.toLowerCase()));
        const missingEmails = Array.from(new Set(requestedEmails)).filter((email) => !existingEmailSet.has(email));
        if (missingEmails.length > 0) {
            throw (0, AppError_1.validationError)('Some recipients do not exist in the system', {
                missing_recipients: missingEmails,
            });
        }
        const campaign = await (0, campaignRepo_1.insertCampaign)(trx, {
            name: args.name,
            subject: args.subject,
            body: args.body,
            createdBy: args.userId,
        });
        await (0, campaignRecipientRepo_1.attachRecipientsToCampaign)(trx, {
            campaignId: campaign.id,
            recipientIds: existingRecipients.map((r) => r.id),
        });
        return campaign;
    });
}
async function getCampaignDetails(args) {
    const campaign = await (0, campaignRepo_1.findCampaignByIdForUser)(knex_1.db, { id: args.campaignId, userId: args.userId });
    if (!campaign)
        throw (0, AppError_1.notFound)('Campaign not found');
    const counts = await (0, campaignRecipientRepo_1.getCampaignRecipientStats)(knex_1.db, { campaignId: args.campaignId });
    return { campaign, stats: computeRates(counts) };
}
async function updateCampaignDraft(args) {
    const updated = await (0, campaignRepo_1.updateDraftCampaign)(knex_1.db, { id: args.campaignId, userId: args.userId, patch: args.patch });
    if (updated)
        return updated;
    const existing = await (0, campaignRepo_1.findCampaignByIdForUser)(knex_1.db, { id: args.campaignId, userId: args.userId });
    if (!existing)
        throw (0, AppError_1.notFound)('Campaign not found');
    throw (0, AppError_1.conflict)('Campaign can only be updated when status is draft');
}
async function deleteCampaignDraft(args) {
    const deletedCount = await (0, campaignRepo_1.deleteDraftCampaign)(knex_1.db, { id: args.campaignId, userId: args.userId });
    if (deletedCount === 1)
        return;
    const existing = await (0, campaignRepo_1.findCampaignByIdForUser)(knex_1.db, { id: args.campaignId, userId: args.userId });
    if (!existing)
        throw (0, AppError_1.notFound)('Campaign not found');
    throw (0, AppError_1.conflict)('Campaign can only be deleted when status is draft');
}
async function scheduleCampaignAt(args) {
    if (!(args.scheduledAt instanceof Date) || Number.isNaN(args.scheduledAt.getTime())) {
        throw (0, AppError_1.validationError)('scheduled_at must be a valid datetime');
    }
    if (args.scheduledAt.getTime() <= Date.now()) {
        throw (0, AppError_1.validationError)('scheduled_at must be a future timestamp');
    }
    const hasConflict = await (0, campaignRepo_1.hasSchedulingConflict)(knex_1.db, {
        userId: args.userId,
        campaignId: args.campaignId,
        scheduledAt: args.scheduledAt,
    });
    if (hasConflict) {
        throw (0, AppError_1.conflict)('Another campaign is already scheduled at this time');
    }
    const scheduled = await (0, campaignRepo_1.scheduleCampaign)(knex_1.db, {
        id: args.campaignId,
        userId: args.userId,
        scheduledAt: args.scheduledAt,
    });
    if (scheduled)
        return scheduled;
    const existing = await (0, campaignRepo_1.findCampaignByIdForUser)(knex_1.db, { id: args.campaignId, userId: args.userId });
    if (!existing)
        throw (0, AppError_1.notFound)('Campaign not found');
    throw (0, AppError_1.conflict)('Cannot schedule a sent campaign');
}
/** Send now: records delivery time for every attached recipient and marks the campaign sent in one transaction so we never show “sent” while recipients still look pending. */
async function sendCampaign(args) {
    return knex_1.db.transaction(async (trx) => {
        const campaign = await (0, campaignRepo_1.findCampaignByIdForUser)(trx, { id: args.campaignId, userId: args.userId });
        if (!campaign)
            throw (0, AppError_1.notFound)('Campaign not found');
        if (campaign.status === 'sent')
            throw (0, AppError_1.conflict)('Campaign is already sent');
        const sentAt = new Date();
        await (0, campaignRecipientRepo_1.markCampaignRecipientsSent)(trx, { campaignId: args.campaignId, sentAt });
        const updatedCampaign = await (0, campaignRepo_1.markCampaignSent)(trx, { id: args.campaignId, userId: args.userId });
        if (!updatedCampaign)
            throw (0, AppError_1.conflict)('Campaign is already sent');
        return updatedCampaign;
    });
}
async function getCampaignStats(args) {
    const campaign = await (0, campaignRepo_1.findCampaignByIdForUser)(knex_1.db, { id: args.campaignId, userId: args.userId });
    if (!campaign)
        throw (0, AppError_1.notFound)('Campaign not found');
    const counts = await (0, campaignRecipientRepo_1.getCampaignRecipientStats)(knex_1.db, { campaignId: args.campaignId });
    return computeRates(counts);
}
