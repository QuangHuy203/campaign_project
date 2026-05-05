import { db } from '../../db/knex';
import { insertCampaign } from '../../repos/campaignRepo';
import {
  attachRecipientsToCampaign,
  getCampaignRecipientStats,
  markCampaignRecipientsSent,
} from '../../repos/campaignRecipientRepo';
import { upsertRecipientsByEmail } from '../../repos/recipientRepo';
import { insertUser } from '../../repos/userRepo';

async function seedCampaignWithRecipients() {
  const user = await insertUser(db, {
    email: 'owner@example.com',
    name: 'Owner',
    passwordHash: 'hash',
  });
  const campaign = await insertCampaign(db, {
    createdBy: user.id,
    name: 'C1',
    subject: 'S1',
    body: 'B1',
  });
  const recipients = await upsertRecipientsByEmail(db, [
    { email: 'cr1@example.com', name: 'CR1' },
    { email: 'cr2@example.com', name: 'CR2' },
    { email: 'cr3@example.com', name: 'CR3' },
  ]);
  return { campaign, recipients };
}

describe('campaignRecipientRepo', () => {
  test('attachRecipientsToCampaign is idempotent', async () => {
    const { campaign, recipients } = await seedCampaignWithRecipients();
    const recipientIds = recipients.map((recipient) => recipient.id);

    await attachRecipientsToCampaign(db, { campaignId: campaign.id, recipientIds });
    await attachRecipientsToCampaign(db, { campaignId: campaign.id, recipientIds });

    const rows = await db('campaign_recipients').where({ campaign_id: campaign.id });
    expect(rows).toHaveLength(3);
  });

  test('markCampaignRecipientsSent updates pending rows and returns updated count', async () => {
    const { campaign, recipients } = await seedCampaignWithRecipients();
    await attachRecipientsToCampaign(db, {
      campaignId: campaign.id,
      recipientIds: recipients.map((recipient) => recipient.id),
    });

    const updatedCount = await markCampaignRecipientsSent(db, {
      campaignId: campaign.id,
      sentAt: new Date(),
    });

    expect(updatedCount).toBe(3);
    const sentRows = await db('campaign_recipients').where({ campaign_id: campaign.id, status: 'sent' });
    expect(sentRows).toHaveLength(3);
  });

  test('getCampaignRecipientStats returns total/sent/failed/opened counts', async () => {
    const { campaign, recipients } = await seedCampaignWithRecipients();
    await attachRecipientsToCampaign(db, {
      campaignId: campaign.id,
      recipientIds: recipients.map((recipient) => recipient.id),
    });

    await db('campaign_recipients')
      .where({ campaign_id: campaign.id, recipient_id: recipients[0].id })
      .update({ status: 'failed' });
    await db('campaign_recipients')
      .where({ campaign_id: campaign.id, recipient_id: recipients[1].id })
      .update({ status: 'sent', sent_at: new Date(), opened_at: new Date() });

    const stats = await getCampaignRecipientStats(db, { campaignId: campaign.id });
    expect(stats).toEqual({
      total: 3,
      sent: 1,
      failed: 1,
      opened: 1,
    });
  });
});
