import type { CampaignStats } from '@/features/campaigns/types/campaign.types';

type CampaignStatsCardProps = {
  stats: CampaignStats;
};

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function CampaignStatsCard({ stats }: CampaignStatsCardProps) {
  return (
    <section className="space-y-4 rounded-lg bg-white p-4 shadow">
      <h3 className="text-base font-semibold">Stats</h3>
      <div className="space-y-2">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span>Open rate</span>
            <span>{percent(stats.open_rate)}</span>
          </div>
          <div className="h-2 rounded bg-slate-200">
            <div className="h-2 rounded bg-blue-500" style={{ width: percent(stats.open_rate) }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span>Send rate</span>
            <span>{percent(stats.send_rate)}</span>
          </div>
          <div className="h-2 rounded bg-slate-200">
            <div className="h-2 rounded bg-green-500" style={{ width: percent(stats.send_rate) }} />
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-600">
        Total: {stats.total} | Sent: {stats.sent} | Failed: {stats.failed} | Opened: {stats.opened}
      </p>
    </section>
  );
}
