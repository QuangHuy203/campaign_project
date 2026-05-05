import type { Campaign } from '@/features/campaigns/types/campaign.types';
import { useCampaignActions } from '@/features/campaigns/hooks/useCampaignActions';
import { Button } from '@/shared/components/ui/Button';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';
import { StatusMessage } from '@/shared/components/ui/StatusMessage';

type CampaignActionsProps = {
  campaign: Campaign;
};

export function CampaignActions({ campaign }: CampaignActionsProps) {
  const { isLoading, actionError, actionSuccess, onDelete, onScheduleNow, onSendNow, canDelete, canSchedule, canSend } = useCampaignActions(campaign);

  return (
    <section className="space-y-3 rounded-lg bg-white p-4 shadow">
      <h3 className="text-base font-semibold">Actions</h3>
      <div className="flex flex-wrap gap-2">
        {canSchedule ? (
          <Button variant="outline" disabled={isLoading} onClick={() => void onScheduleNow()}>
            Schedule
          </Button>
        ) : null}
        {canSend ? (
          <Button disabled={isLoading} onClick={() => void onSendNow()}>
            Send
          </Button>
        ) : null}
        {canDelete ? (
          <Button variant="danger" disabled={isLoading} onClick={() => void onDelete()}>
            Delete
          </Button>
        ) : null}
      </div>
      <StatusMessage type="success" message={actionSuccess} />
      <ErrorMessage message={actionError} />
    </section>
  );
}
