import type { Request, Response } from 'express';
import { createCampaignSchema, idParamSchema, scheduleCampaignSchema, updateCampaignSchema } from '../validators/campaignValidators';
import {
  createCampaign,
  deleteCampaignDraft,
  getCampaignDetails,
  getCampaignStats,
  listCampaigns,
  scheduleCampaignAt,
  sendCampaign,
  updateCampaignDraft,
} from '../services/campaignService';

function requireUserId(req: Request): number {
  if (!req.user) throw new Error('authMiddleware must run before controller');
  return req.user.id;
}

export async function list(req: Request, res: Response) {
  const userId = requireUserId(req);
  const campaigns = await listCampaigns(userId);
  return res.status(200).json({ data: campaigns });
}

/** Create a new draft campaign for the signed-in user (drafts are the only editable state). */
export async function create(req: Request, res: Response) {
  const userId = requireUserId(req);
  const body = createCampaignSchema.parse(req.body);
  const campaign = await createCampaign({ userId, ...body });
  return res.status(201).json({ data: campaign });
}

export async function details(req: Request, res: Response) {
  const userId = requireUserId(req);
  const { id } = idParamSchema.parse(req.params);
  const result = await getCampaignDetails({ userId, campaignId: id });
  return res.status(200).json({ data: result });
}

export async function update(req: Request, res: Response) {
  const userId = requireUserId(req);
  const { id } = idParamSchema.parse(req.params);
  const patch = updateCampaignSchema.parse(req.body);
  const campaign = await updateCampaignDraft({ userId, campaignId: id, patch });
  return res.status(200).json({ data: campaign });
}

export async function remove(req: Request, res: Response) {
  const userId = requireUserId(req);
  const { id } = idParamSchema.parse(req.params);
  await deleteCampaignDraft({ userId, campaignId: id });
  return res.status(204).send();
}

export async function schedule(req: Request, res: Response) {
  const userId = requireUserId(req);
  const { id } = idParamSchema.parse(req.params);
  const body = scheduleCampaignSchema.parse(req.body);
  const scheduledAt = new Date(body.scheduled_at);
  const campaign = await scheduleCampaignAt({ userId, campaignId: id, scheduledAt });
  return res.status(200).json({ data: campaign });
}

/** “Send now” is an explicit user action; the service enforces one-way transition to protect reporting integrity. */
export async function send(req: Request, res: Response) {
  const userId = requireUserId(req);
  const { id } = idParamSchema.parse(req.params);
  const campaign = await sendCampaign({ userId, campaignId: id });
  return res.status(200).json({ data: campaign });
}

export async function stats(req: Request, res: Response) {
  const userId = requireUserId(req);
  const { id } = idParamSchema.parse(req.params);
  const result = await getCampaignStats({ userId, campaignId: id });
  return res.status(200).json({ data: result });
}

