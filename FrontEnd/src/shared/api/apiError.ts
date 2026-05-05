import type { ApiError } from '@/shared/types/api.types';
import { parseApiError } from '@/shared/lib/apiErrorParser';

export function mapAxiosError(error: unknown): ApiError {
  const fallback: ApiError = {
    code: 'INTERNAL_ERROR',
    message: 'Unexpected error',
  };

  const parsed = parseApiError(error);
  if (parsed.apiError) {
    return parsed.apiError;
  }

  if (parsed.fallbackMessage) {
    return { ...fallback, message: parsed.fallbackMessage };
  }

  return fallback;
}
