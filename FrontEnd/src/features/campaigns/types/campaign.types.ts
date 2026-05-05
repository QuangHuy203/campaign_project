import { z } from 'zod';

export const campaignStatusSchema = z.enum(['draft', 'scheduled', 'sent']);

export const campaignSchema = z.object({
  id: z.number(),
  name: z.string(),
  subject: z.string(),
  body: z.string(),
  status: campaignStatusSchema,
  scheduled_at: z.string().nullable(),
  created_by: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const campaignStatsSchema = z.object({
  total: z.number(),
  sent: z.number(),
  failed: z.number(),
  opened: z.number(),
  open_rate: z.number(),
  send_rate: z.number(),
});

export const campaignDetailSchema = z.object({
  campaign: campaignSchema,
  stats: campaignStatsSchema,
});

export const recipientInputSchema = z.object({
  email: z.string().email().max(320),
  name: z.string().min(1).max(200),
});

export const createCampaignPayloadSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(10000),
  recipients: z.array(recipientInputSchema).min(1),
});

export const updateCampaignPayloadSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    subject: z.string().min(1).max(300).optional(),
    body: z.string().min(1).max(10000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: 'No fields to update' });

export const scheduleCampaignPayloadSchema = z.object({
  scheduled_at: z.string().datetime(),
});

export type Campaign = z.infer<typeof campaignSchema>;
export type CampaignStats = z.infer<typeof campaignStatsSchema>;
export type CampaignDetail = z.infer<typeof campaignDetailSchema>;
export type CreateCampaignPayload = z.infer<typeof createCampaignPayloadSchema>;
export type UpdateCampaignPayload = z.infer<typeof updateCampaignPayloadSchema>;
export type ScheduleCampaignPayload = z.infer<typeof scheduleCampaignPayloadSchema>;
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;
