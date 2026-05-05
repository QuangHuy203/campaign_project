import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '@/app/store';
import { isTokenExpired } from '@/features/auth/lib/tokenStorage';
import { clearAuth } from '@/features/auth/store/auth.slice';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthenticated = token ? !isTokenExpired(token) : false;

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      dispatch(clearAuth());
    }
  }, [dispatch, token]);

  return {
    token,
    isAuthenticated,
  };
}
