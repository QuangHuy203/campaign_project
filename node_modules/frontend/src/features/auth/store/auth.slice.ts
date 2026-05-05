import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { clearPersistedToken, getStoredValidToken, persistToken } from '@/features/auth/lib/tokenStorage';
import type { AuthState } from '@/features/auth/types/auth.types';

const initialState: AuthState = {
  token: getStoredValidToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      persistToken(action.payload);
    },
    clearAuth(state) {
      state.token = null;
      clearPersistedToken();
    },
  },
});

export const { setToken, clearAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;
