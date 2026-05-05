import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { CampaignForm } from '@/features/campaigns/components/CampaignForm';
import { useCreateCampaignMutation } from '@/features/campaigns/store/campaigns.api';
import type { CreateCampaignPayload } from '@/features/campaigns/types/campaign.types';
import { Button } from '@/shared/components/ui/Button';
import { StatusMessage } from '@/shared/components/ui/StatusMessage';
import { getRequestErrorMessage } from '@/shared/lib/requestFeedback';

export function CampaignNewPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [createCampaign, createState] = useCreateCampaignMutation();
  const [submitMessage, setSubmitMessage] = useState<string | undefined>();
  const [submitMessageType, setSubmitMessageType] = useState<'success' | 'error' | 'info'>('info');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const onSubmit = async (payload: CreateCampaignPayload) => {
    setSubmitMessage(undefined);
    try {
      const created = await createCampaign(payload).unwrap();
      navigate(`/campaigns/${created.id}`, {
        state: {
          notice: { type: 'success', message: 'Campaign created successfully.' },
        },
      });
    } catch (error) {
      setSubmitMessageType('error');
      setSubmitMessage(getRequestErrorMessage(error, 'Failed to create campaign.'));
    }
  };

  const onBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/campaigns');
  };

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <Button type="button" variant="ghost" onClick={onBack} className="w-fit">
        Back
      </Button>
      <h1 className="text-2xl font-semibold">Create campaign</h1>
      <StatusMessage type={submitMessageType} message={submitMessage} />
      <CampaignForm isLoading={createState.isLoading} onSubmit={onSubmit} />
    </main>
  );
}
