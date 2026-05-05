import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useDeleteCampaignMutation,
  useScheduleCampaignMutation,
  useSendCampaignMutation,
} from '@/features/campaigns/store/campaigns.api';
import type { Campaign, CampaignStatus } from '@/features/campaigns/types/campaign.types';
import { getRequestErrorMessage } from '@/shared/lib/requestFeedback';

type UseCampaignActionsResult = {
  isLoading: boolean;
  actionError?: string;
  actionSuccess?: string;
  onScheduleNow: () => Promise<void>;
  onSendNow: () => Promise<void>;
  onDelete: () => Promise<void>;
  canSchedule: boolean;
  canSend: boolean;
  canDelete: boolean;
};

export function useCampaignActions(campaign: Campaign): UseCampaignActionsResult {
  const navigate = useNavigate();
  const [scheduleCampaign, scheduleState] = useScheduleCampaignMutation();
  const [sendCampaign, sendState] = useSendCampaignMutation();
  const [deleteCampaign, deleteState] = useDeleteCampaignMutation();
  const [actionError, setActionError] = useState<string | undefined>();
  const [actionSuccess, setActionSuccess] = useState<string | undefined>();

  const status: CampaignStatus = campaign.status;
  const canSchedule = status !== 'sent';
  const canSend = status !== 'sent';
  const canDelete = status === 'draft';

  const onScheduleNow = async () => {
    const scheduledAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    setActionError(undefined);
    setActionSuccess(undefined);
    try {
      await scheduleCampaign({ id: campaign.id, payload: { scheduled_at: scheduledAt } }).unwrap();
      setActionSuccess('Campaign scheduled successfully.');
    } catch (error) {
      setActionError(getRequestErrorMessage(error, 'Failed to schedule campaign.'));
    }
  };

  const onSendNow = async () => {
    setActionError(undefined);
    setActionSuccess(undefined);
    try {
      await sendCampaign(campaign.id).unwrap();
      setActionSuccess('Campaign sent successfully.');
    } catch (error) {
      setActionError(getRequestErrorMessage(error, 'Failed to send campaign.'));
    }
  };

  const onDelete = async () => {
    setActionError(undefined);
    setActionSuccess(undefined);
    try {
      await deleteCampaign(campaign.id).unwrap();
      navigate('/campaigns', {
        state: { notice: { type: 'success', message: 'Campaign deleted successfully.' } },
      });
    } catch (error) {
      setActionError(getRequestErrorMessage(error, 'Failed to delete campaign.'));
    }
  };

  return {
    isLoading: scheduleState.isLoading || sendState.isLoading || deleteState.isLoading,
    actionError,
    actionSuccess,
    onScheduleNow,
    onSendNow,
    onDelete,
    canSchedule,
    canSend,
    canDelete,
  };
}
