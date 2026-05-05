import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '@/features/auth/store/auth.slice';
import { campaignsApi } from '@/features/campaigns/store/campaigns.api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [campaignsApi.reducerPath]: campaignsApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(campaignsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
