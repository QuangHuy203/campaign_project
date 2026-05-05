import { parseApiError } from '@/shared/lib/apiErrorParser';

export function getRtkErrorMessage(error: unknown): string | undefined {
  return parseApiError(error).apiError?.message;
}
