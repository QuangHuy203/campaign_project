import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { CampaignDetailPage } from '@/features/campaigns/pages/CampaignDetailPage';
import { CampaignListPage } from '@/features/campaigns/pages/CampaignListPage';
import { CampaignNewPage } from '@/features/campaigns/pages/CampaignNewPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/campaigns" element={<CampaignListPage />} />
      <Route path="/campaigns/new" element={<CampaignNewPage />} />
      <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
      <Route path="*" element={<Navigate to="/campaigns" replace />} />
    </Routes>
  );
}
