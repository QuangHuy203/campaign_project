import { z } from 'zod';

import { http } from '@/shared/api/http';
import type { ApiSuccessResponse } from '@/shared/types/api.types';
import {
  campaignDetailSchema,
  campaignSchema,
  campaignStatsSchema,
  createCampaignPayloadSchema,
  scheduleCampaignPayloadSchema,
  updateCampaignPayloadSchema,
  type Campaign,
  type CampaignDetail,
  type CampaignStats,
  type CreateCampaignPayload,
  type ScheduleCampaignPayload,
  type UpdateCampaignPayload,
} from '@/features/campaigns/types/campaign.types';

const listCampaignsEnvelopeSchema = z.object({
  data: z.array(campaignSchema),
});

const campaignEnvelopeSchema = z.object({
  data: campaignSchema,
});

const campaignDetailEnvelopeSchema = z.object({
  data: campaignDetailSchema,
});

const campaignStatsEnvelopeSchema = z.object({
  data: campaignStatsSchema,
});

export async function listCampaignsService(token: string): Promise<Campaign[]> {
  const response = await http.get<ApiSuccessResponse<Campaign[]>>('/campaigns', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return listCampaignsEnvelopeSchema.parse(response.data).data;
}

export async function createCampaignService(token: string, payload: CreateCampaignPayload): Promise<Campaign> {
  const parsedPayload = createCampaignPayloadSchema.parse(payload);
  const response = await http.post<ApiSuccessResponse<Campaign>>('/campaigns', parsedPayload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return campaignEnvelopeSchema.parse(response.data).data;
}

export async function getCampaignDetailService(token: string, id: number): Promise<CampaignDetail> {
  const response = await http.get<ApiSuccessResponse<CampaignDetail>>(`/campaigns/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return campaignDetailEnvelopeSchema.parse(response.data).data;
}

export async function getCampaignStatsService(token: string, id: number): Promise<CampaignStats> {
  const response = await http.get<ApiSuccessResponse<CampaignStats>>(`/campaigns/${id}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return campaignStatsEnvelopeSchema.parse(response.data).data;
}

export async function updateCampaignService(token: string, id: number, payload: UpdateCampaignPayload): Promise<Campaign> {
  const parsedPayload = updateCampaignPayloadSchema.parse(payload);
  const response = await http.patch<ApiSuccessResponse<Campaign>>(`/campaigns/${id}`, parsedPayload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return campaignEnvelopeSchema.parse(response.data).data;
}

export async function scheduleCampaignService(token: string, id: number, payload: ScheduleCampaignPayload): Promise<Campaign> {
  const parsedPayload = scheduleCampaignPayloadSchema.parse(payload);
  const response = await http.post<ApiSuccessResponse<Campaign>>(`/campaigns/${id}/schedule`, parsedPayload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return campaignEnvelopeSchema.parse(response.data).data;
}

export async function sendCampaignService(token: string, id: number): Promise<Campaign> {
  const response = await http.post<ApiSuccessResponse<Campaign>>(
    `/campaigns/${id}/send`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return campaignEnvelopeSchema.parse(response.data).data;
}

export async function deleteCampaignService(token: string, id: number): Promise<void> {
  await http.delete(`/campaigns/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
