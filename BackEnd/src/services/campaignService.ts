import { db } from '../db/knex';
import { conflict, notFound, validationError } from '../errors/AppError';
import {
  deleteDraftCampaign,
  findCampaignByIdForUser,
  insertCampaign,
  listCampaignsByUser,
  markCampaignSent,
  scheduleCampaign,
  updateDraftCampaign,
} from '../repos/campaignRepo';
import { attachRecipientsToCampaign, getCampaignRecipientStats, markCampaignRecipientsSent } from '../repos/campaignRecipientRepo';
import { upsertRecipientsByEmail } from '../repos/recipientRepo';

export type CampaignStats = {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  open_rate: number;
  send_rate: number;
};

function computeRates(counts: { total: number; sent: number; failed: number; opened: number }): CampaignStats {
  const open_rate = counts.sent === 0 ? 0 : counts.opened / counts.sent;
  const send_rate = counts.total === 0 ? 0 : counts.sent / counts.total;
  return { ...counts, open_rate, send_rate };
}

export async function listCampaigns(userId: number) {
  return listCampaignsByUser(db, userId);
}

export async function createCampaign(args: {
  userId: number;
  name: string;
  subject: string;
  body: string;
  recipients: Array<{ email: string; name: string }>;
}) {
  return db.transaction(async (trx) => {
    const campaign = await insertCampaign(trx, {
      name: args.name,
      subject: args.subject,
      body: args.body,
      createdBy: args.userId,
    });

    const recipientRows = await upsertRecipientsByEmail(trx, args.recipients);
    await attachRecipientsToCampaign(trx, {
      campaignId: campaign.id,
      recipientIds: recipientRows.map((r) => r.id),
    });

    return campaign;
  });
}

export async function getCampaignDetails(args: { userId: number; campaignId: number }) {
  const campaign = await findCampaignByIdForUser(db, { id: args.campaignId, userId: args.userId });
  if (!campaign) throw notFound('Campaign not found');

  const counts = await getCampaignRecipientStats(db, { campaignId: args.campaignId });
  return { campaign, stats: computeRates(counts) };
}

export async function updateCampaignDraft(args: {
  userId: number;
  campaignId: number;
  patch: { name?: string; subject?: string; body?: string };
}) {
  const updated = await updateDraftCampaign(db, { id: args.campaignId, userId: args.userId, patch: args.patch });
  if (updated) return updated;

  const existing = await findCampaignByIdForUser(db, { id: args.campaignId, userId: args.userId });
  if (!existing) throw notFound('Campaign not found');
  throw conflict('Campaign can only be updated when status is draft');
}

export async function deleteCampaignDraft(args: { userId: number; campaignId: number }) {
  const deletedCount = await deleteDraftCampaign(db, { id: args.campaignId, userId: args.userId });
  if (deletedCount === 1) return;

  const existing = await findCampaignByIdForUser(db, { id: args.campaignId, userId: args.userId });
  if (!existing) throw notFound('Campaign not found');
  throw conflict('Campaign can only be deleted when status is draft');
}

export async function scheduleCampaignAt(args: { userId: number; campaignId: number; scheduledAt: Date }) {
  if (!(args.scheduledAt instanceof Date) || Number.isNaN(args.scheduledAt.getTime())) {
    throw validationError('scheduled_at must be a valid datetime');
  }
  if (args.scheduledAt.getTime() <= Date.now()) {
    throw validationError('scheduled_at must be a future timestamp');
  }

  const scheduled = await scheduleCampaign(db, {
    id: args.campaignId,
    userId: args.userId,
    scheduledAt: args.scheduledAt,
  });

  if (scheduled) return scheduled;

  const existing = await findCampaignByIdForUser(db, { id: args.campaignId, userId: args.userId });
  if (!existing) throw notFound('Campaign not found');
  throw conflict('Cannot schedule a sent campaign');
}

/** Send now: records delivery time for every attached recipient and marks the campaign sent in one transaction so we never show “sent” while recipients still look pending. */
export async function sendCampaign(args: { userId: number; campaignId: number }) {
  return db.transaction(async (trx) => {
    const campaign = await findCampaignByIdForUser(trx, { id: args.campaignId, userId: args.userId });
    if (!campaign) throw notFound('Campaign not found');
    if (campaign.status === 'sent') throw conflict('Campaign is already sent');

    const sentAt = new Date();
    await markCampaignRecipientsSent(trx, { campaignId: args.campaignId, sentAt });

    const updatedCampaign = await markCampaignSent(trx, { id: args.campaignId, userId: args.userId });
    if (!updatedCampaign) throw conflict('Campaign is already sent');

    return updatedCampaign;
  });
}

export async function getCampaignStats(args: { userId: number; campaignId: number }): Promise<CampaignStats> {
  const campaign = await findCampaignByIdForUser(db, { id: args.campaignId, userId: args.userId });
  if (!campaign) throw notFound('Campaign not found');
  const counts = await getCampaignRecipientStats(db, { campaignId: args.campaignId });
  return computeRates(counts);
}

