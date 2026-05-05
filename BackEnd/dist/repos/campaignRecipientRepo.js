"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachRecipientsToCampaign = attachRecipientsToCampaign;
exports.markCampaignRecipientsSent = markCampaignRecipientsSent;
exports.getCampaignRecipientStats = getCampaignRecipientStats;
/** Attach is idempotent: safe to call multiple times while building a campaign’s audience. */
async function attachRecipientsToCampaign(db, args) {
    if (args.recipientIds.length === 0)
        return;
    await db('campaign_recipients')
        .insert(args.recipientIds.map((recipientId) => ({ campaign_id: args.campaignId, recipient_id: recipientId })))
        .onConflict(['campaign_id', 'recipient_id'])
        .ignore();
}
/** Bulk update ensures all recipients share the same “sent” timestamp for consistent reporting and attribution. */
async function markCampaignRecipientsSent(db, args) {
    const result = await db('campaign_recipients')
        .where({ campaign_id: args.campaignId })
        .whereNot({ status: 'sent' })
        .update({ status: 'sent', sent_at: args.sentAt });
    return result;
}
/** Stats are aggregated to power dashboards without exposing per-recipient rows from this layer. */
async function getCampaignRecipientStats(db, args) {
    const [totalRow] = await db('campaign_recipients')
        .where({ campaign_id: args.campaignId })
        .count({ count: '*' });
    const [sentRow] = await db('campaign_recipients')
        .where({ campaign_id: args.campaignId, status: 'sent' })
        .count({ count: '*' });
    const [failedRow] = await db('campaign_recipients')
        .where({ campaign_id: args.campaignId, status: 'failed' })
        .count({ count: '*' });
    const [openedRow] = await db('campaign_recipients')
        .where({ campaign_id: args.campaignId })
        .whereNotNull('opened_at')
        .count({ count: '*' });
    return {
        total: Number(totalRow?.count ?? 0),
        sent: Number(sentRow?.count ?? 0),
        failed: Number(failedRow?.count ?? 0),
        opened: Number(openedRow?.count ?? 0),
    };
}
