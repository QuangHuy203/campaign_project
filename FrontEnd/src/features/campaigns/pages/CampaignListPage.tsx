import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { CampaignStatusBadge } from '@/features/campaigns/components/CampaignStatusBadge';
import { useListCampaignsQuery } from '@/features/campaigns/store/campaigns.api';
import { Button } from '@/shared/components/ui/Button';
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

export function CampaignListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, error } = useListCampaignsQuery();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const campaigns = data ?? [];
  const errorMessage = getRtkErrorMessage(error);
  const totalPages = Math.max(1, Math.ceil(campaigns.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pagedCampaigns = campaigns.slice(startIndex, startIndex + pageSize);
  const isEmpty = campaigns.length === 0;
  const notice = (location.state as NoticeState | null)?.notice;

  useEffect(() => {
    if (!notice) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, navigate, notice]);

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center p-4">
        <section className="w-full rounded-lg bg-white p-6 text-center shadow">
          <h1 className="text-xl font-semibold">Session expired</h1>
          <p className="mt-2 text-sm text-slate-600">Please sign in again to view campaigns.</p>
          <div className="mt-4">
            <Link to="/login">
              <Button>Go to login</Button>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Spinner />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Campaigns</h1>
        <Link to="/campaigns/new">
          <Button>New campaign</Button>
        </Link>
      </header>
      <StatusMessage type={notice?.type ?? 'info'} message={notice?.message} />
      <ErrorMessage message={errorMessage} />
      {isEmpty ? (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-medium text-slate-900">No campaigns yet</h2>
          <p className="mt-2 text-sm text-slate-600">Create your first campaign to start sending emails.</p>
          <div className="mt-4">
            <Link to="/campaigns/new">
              <Button>Create campaign</Button>
            </Link>
          </div>
        </section>
      ) : null}
      <section className="overflow-hidden rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {pagedCampaigns.map((campaign) => (
              <tr key={campaign.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{campaign.name}</td>
                <td className="px-4 py-3">{campaign.subject}</td>
                <td className="px-4 py-3">
                  <CampaignStatusBadge status={campaign.status} />
                </td>
                <td className="px-4 py-3">
                  <Link className="text-blue-600 hover:underline" to={`/campaigns/${campaign.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <footer className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Page {page} / {totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
            Previous
          </Button>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
            Next
          </Button>
        </div>
      </footer>
    </main>
  );
}
