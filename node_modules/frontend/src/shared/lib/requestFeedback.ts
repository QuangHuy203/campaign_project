import { parseApiError } from '@/shared/lib/apiErrorParser';

export function getRequestErrorMessage(error: unknown, fallbackMessage: string): string {
  const parsed = parseApiError(error);
  if (parsed.httpStatus && parsed.httpStatus >= 500) {
    return 'System error. Please try again later.';
  }
  if (parsed.apiError?.code === 'INTERNAL_ERROR') {
    return 'System error. Please try again later.';
  }
  if (parsed.apiError?.message) {
    return parsed.apiError.message;
  }
  if (parsed.fallbackMessage) {
    return parsed.fallbackMessage;
  }
  return fallbackMessage;
}

