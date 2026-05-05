import { useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { CampaignActions } from '@/features/campaigns/components/CampaignActions';
import { CampaignStatusBadge } from '@/features/campaigns/components/CampaignStatusBadge';
import { CampaignStatsCard } from '@/features/campaigns/components/CampaignStatsCard';
import { useGetCampaignDetailQuery } from '@/features/campaigns/store/campaigns.api';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';
import { Spinner } from '@/shared/components/ui/Spinner';
import { StatusMessage } from '@/shared/components/ui/StatusMessage';
import { getRtkErrorMessage } from '@/shared/lib/rtkError';

type NoticeState = {
  notice?: {
    type: 'success' | 'error' | 'info';
    message: string;
  };
};

export function CampaignDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const parsedId = Number(id);
  const { isAuthenticated } = useAuth();
  const { data, isLoading, error } = useGetCampaignDetailQuery(parsedId, {
    skip: Number.isNaN(parsedId),
  });
  const notice = (location.state as NoticeState | null)?.notice;

  useEffect(() => {
    if (!notice) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, navigate, notice]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (Number.isNaN(parsedId)) {
    return <Navigate to="/campaigns" replace />;
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Spinner />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-4xl p-4">
        <ErrorMessage message={getRtkErrorMessage(error)} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-4">
      <Link to="/campaigns" className="text-sm text-blue-600 hover:underline">
        Back to campaigns
      </Link>
      <StatusMessage type={notice?.type ?? 'info'} message={notice?.message} />
      <section className="space-y-3 rounded-lg bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{data.campaign.name}</h1>
          <CampaignStatusBadge status={data.campaign.status} />
        </div>
        <p className="text-sm text-slate-600">Subject: {data.campaign.subject}</p>
        <p className="whitespace-pre-wrap text-sm">{data.campaign.body}</p>
      </section>
      <CampaignStatsCard stats={data.stats} />
      <CampaignActions campaign={data.campaign} />
      <section className="rounded-lg bg-white p-4 shadow">
        <h3 className="mb-2 text-base font-semibold">Recipient list</h3>
        <p className="text-sm text-slate-600">
          Backend currently does not expose recipient detail list on campaign detail. This UI can render the list once an endpoint is added.
        </p>
      </section>
    </main>
  );
}
