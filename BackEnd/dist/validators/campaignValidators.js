"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleCampaignSchema = exports.updateCampaignSchema = exports.createCampaignSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive(),
});
exports.createCampaignSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200).transform((s) => s.trim()),
    subject: zod_1.z.string().min(1).max(300).transform((s) => s.trim()),
    body: zod_1.z.string().min(1).max(10000),
    recipients: zod_1.z
        .array(zod_1.z.object({
        email: zod_1.z.string().email().max(320).transform((s) => s.trim().toLowerCase()),
        name: zod_1.z.string().min(1).max(200).transform((s) => s.trim()),
    }))
        .min(1),
});
exports.updateCampaignSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(200).transform((s) => s.trim()).optional(),
    subject: zod_1.z.string().min(1).max(300).transform((s) => s.trim()).optional(),
    body: zod_1.z.string().min(1).max(10000).optional(),
})
    .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' });
exports.scheduleCampaignSchema = zod_1.z.object({
    scheduled_at: zod_1.z.string().datetime(),
});
