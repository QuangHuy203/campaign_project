import { db } from '../../db/knex';
import {
  deleteDraftCampaign,
  findCampaignByIdForUser,
  hasSchedulingConflict,
  insertCampaign,
  listCampaignsByUser,
  markCampaignSent,
  scheduleCampaign,
  updateDraftCampaign,
} from '../../repos/campaignRepo';
import { insertUser } from '../../repos/userRepo';

async function seedOwner(email = 'owner_campaign@example.com') {
  return insertUser(db, {
    email,
    name: 'Owner',
    passwordHash: 'hash',
  });
}

describe('campaignRepo', () => {
  test('insertCampaign creates draft campaign with null schedule', async () => {
    const owner = await seedOwner();
    const campaign = await insertCampaign(db, {
      createdBy: owner.id,
      name: 'Campaign A',
      subject: 'Subject A',
      body: 'Body A',
    });

    expect(Number(campaign.id)).toBeGreaterThan(0);
    expect(campaign.status).toBe('draft');
    expect(campaign.scheduled_at).toBeNull();
    expect(campaign.created_by).toBe(owner.id);
  });

  test('listCampaignsByUser returns only owner campaigns', async () => {
    const owner1 = await seedOwner('owner1@example.com');
    const owner2 = await seedOwner('owner2@example.com');
    await insertCampaign(db, { createdBy: owner1.id, name: 'A1', subject: 'S', body: 'B' });
    await insertCampaign(db, { createdBy: owner1.id, name: 'A2', subject: 'S', body: 'B' });
    await insertCampaign(db, { createdBy: owner2.id, name: 'B1', subject: 'S', body: 'B' });

    const rows = await listCampaignsByUser(db, owner1.id);
    expect(rows).toHaveLength(2);
    expect(rows.every((row) => row.created_by === owner1.id)).toBe(true);
  });

  test('findCampaignByIdForUser returns null for non-owner', async () => {
    const owner1 = await seedOwner('owner_find_1@example.com');
    const owner2 = await seedOwner('owner_find_2@example.com');
    const campaign = await insertCampaign(db, {
      createdBy: owner1.id,
      name: 'Owned',
      subject: 'S',
      body: 'B',
    });

    const found = await findCampaignByIdForUser(db, { id: campaign.id, userId: owner2.id });
    expect(found).toBeNull();
  });

  test('updateDraftCampaign updates only draft campaigns', async () => {
    const owner = await seedOwner('owner_update@example.com');
    const campaign = await insertCampaign(db, { createdBy: owner.id, name: 'N', subject: 'S', body: 'B' });
    const updated = await updateDraftCampaign(db, {
      id: campaign.id,
      userId: owner.id,
      patch: { subject: 'Updated Subject' },
    });
    expect(updated?.subject).toBe('Updated Subject');

    await markCampaignSent(db, { id: campaign.id, userId: owner.id });
    const rejected = await updateDraftCampaign(db, {
      id: campaign.id,
      userId: owner.id,
      patch: { subject: 'Nope' },
    });
    expect(rejected).toBeNull();
  });

  test('deleteDraftCampaign deletes draft and rejects sent', async () => {
    const owner = await seedOwner('owner_delete@example.com');
    const draft = await insertCampaign(db, { createdBy: owner.id, name: 'D', subject: 'S', body: 'B' });
    const deletedCount = await deleteDraftCampaign(db, { id: draft.id, userId: owner.id });
    expect(deletedCount).toBe(1);

    const sent = await insertCampaign(db, { createdBy: owner.id, name: 'S', subject: 'S', body: 'B' });
    await markCampaignSent(db, { id: sent.id, userId: owner.id });
    const deletedSent = await deleteDraftCampaign(db, { id: sent.id, userId: owner.id });
    expect(deletedSent).toBe(0);
  });

  test('scheduleCampaign and hasSchedulingConflict work for scheduled campaigns', async () => {
    const owner = await seedOwner('owner_schedule@example.com');
    const c1 = await insertCampaign(db, { createdBy: owner.id, name: 'C1', subject: 'S', body: 'B' });
    const c2 = await insertCampaign(db, { createdBy: owner.id, name: 'C2', subject: 'S', body: 'B' });
    const when = new Date(Date.now() + 3600_000);

    const scheduled = await scheduleCampaign(db, { id: c1.id, userId: owner.id, scheduledAt: when });
    expect(scheduled?.status).toBe('scheduled');

    const hasConflict = await hasSchedulingConflict(db, {
      userId: owner.id,
      campaignId: c2.id,
      scheduledAt: when,
    });
    expect(hasConflict).toBe(true);
  });
});
