import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import type { AppDispatch } from '@/app/store';
import { clearAuth } from '@/features/auth/store/auth.slice';
import { logoutService } from '@/features/auth/services/auth.service';
import { campaignsApi } from '@/features/campaigns/store/campaigns.api';

type LoginNotice = {
  type: 'success' | 'error' | 'info';
  message: string;
};

export function useLogout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const logout = useCallback(
    async (token: string | null) => {
      let notice: LoginNotice = { type: 'success', message: 'Logged out successfully.' };

      if (token) {
        try {
          await logoutService(token);
        } catch {
          // Clear local auth even if the network request fails.
          notice = { type: 'error', message: 'Logout failed. Please sign in again.' };
        }
      }

      dispatch(clearAuth());
      dispatch(campaignsApi.util.resetApiState());
      navigate('/login', { replace: true, state: { notice } });
    },
    [dispatch, navigate],
  );

  return { logout };
}
