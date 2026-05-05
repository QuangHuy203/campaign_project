import type { Knex } from 'knex';

export type CampaignRecipientStatus = 'pending' | 'sent' | 'failed';

export type CampaignRecipientRow = {
  campaign_id: number;
  recipient_id: number;
  status: CampaignRecipientStatus;
  sent_at: Date | null;
  opened_at: Date | null;
};

/** Attach is idempotent: safe to call multiple times while building a campaign’s audience. */
export async function attachRecipientsToCampaign(
  db: Knex,
  args: { campaignId: number; recipientIds: number[] },
): Promise<void> {
  if (args.recipientIds.length === 0) return;
  await db('campaign_recipients')
    .insert(args.recipientIds.map((recipientId) => ({ campaign_id: args.campaignId, recipient_id: recipientId })))
    .onConflict(['campaign_id', 'recipient_id'])
    .ignore();
}

/** Bulk update ensures all recipients share the same “sent” timestamp for consistent reporting and attribution. */
export async function markCampaignRecipientsSent(
  db: Knex,
  args: { campaignId: number; sentAt: Date },
): Promise<number> {
  const result = await db('campaign_recipients')
    .where({ campaign_id: args.campaignId })
    .whereNot({ status: 'sent' })
    .update({ status: 'sent', sent_at: args.sentAt });

  return result;
}

/** Stats are aggregated to power dashboards without exposing per-recipient rows from this layer. */
export async function getCampaignRecipientStats(
  db: Knex,
  args: { campaignId: number },
): Promise<{ total: number; sent: number; failed: number; opened: number }> {
  const [totalRow] = await db('campaign_recipients')
    .where({ campaign_id: args.campaignId })
    .count<{ count: string }[]>({ count: '*' });

  const [sentRow] = await db('campaign_recipients')
    .where({ campaign_id: args.campaignId, status: 'sent' })
    .count<{ count: string }[]>({ count: '*' });

  const [failedRow] = await db('campaign_recipients')
    .where({ campaign_id: args.campaignId, status: 'failed' })
    .count<{ count: string }[]>({ count: '*' });

  const [openedRow] = await db('campaign_recipients')
    .where({ campaign_id: args.campaignId })
    .whereNotNull('opened_at')
    .count<{ count: string }[]>({ count: '*' });

  return {
    total: Number(totalRow?.count ?? 0),
    sent: Number(sentRow?.count ?? 0),
    failed: Number(failedRow?.count ?? 0),
    opened: Number(openedRow?.count ?? 0),
  };
}

