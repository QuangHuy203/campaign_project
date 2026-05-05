import type { CampaignStatus } from '@/features/campaigns/types/campaign.types';
import { cn } from '@/shared/lib/cn';

type CampaignStatusBadgeProps = {
  status: CampaignStatus;
};

const statusClasses: Record<CampaignStatus, string> = {
  draft: 'bg-slate-200 text-slate-700',
  scheduled: 'bg-blue-100 text-blue-700',
  sent: 'bg-green-100 text-green-700',
};

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  return <span className={cn('rounded-full px-2 py-1 text-xs font-semibold capitalize', statusClasses[status])}>{status}</span>;
}
