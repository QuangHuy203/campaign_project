import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(200).transform((s) => s.trim()),
  subject: z.string().min(1).max(300).transform((s) => s.trim()),
  body: z.string().min(1).max(10000),
  recipients: z
    .array(
      z.object({
        email: z.string().email().max(320).transform((s) => s.trim().toLowerCase()),
        name: z.string().min(1).max(200).transform((s) => s.trim()),
      }),
    )
    .min(1),
});

export const updateCampaignSchema = z
  .object({
    name: z.string().min(1).max(200).transform((s) => s.trim()).optional(),
    subject: z.string().min(1).max(300).transform((s) => s.trim()).optional(),
    body: z.string().min(1).max(10000).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' });

export const scheduleCampaignSchema = z.object({
  scheduled_at: z.string().datetime(),
});

