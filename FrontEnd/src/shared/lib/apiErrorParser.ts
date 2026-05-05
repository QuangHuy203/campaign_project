import type { ApiError } from '@/shared/types/api.types';

type ParsedError = {
  apiError?: ApiError;
  httpStatus?: number;
  fallbackMessage?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readApiError(value: unknown): ApiError | undefined {
  if (!isObject(value)) return undefined;
  const code = value.code;
  const message = value.message;
  if (typeof code !== 'string' || typeof message !== 'string') return undefined;
  return {
    code: code as ApiError['code'],
    message,
    details: value.details,
  };
}

function readStatus(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function parseApiError(error: unknown): ParsedError {
  if (!isObject(error)) {
    return {};
  }

  // RTK fakeBaseQuery custom errors may already be ApiError.
  const directApiError = readApiError(error);
  if (directApiError) {
    return { apiError: directApiError };
  }

  // Axios-like shape.
  const response = isObject(error.response) ? error.response : undefined;
  const responseData = response?.data;
  const wrappedApiError = isObject(responseData) ? readApiError(responseData.error) : undefined;
  const rawApiError = readApiError(responseData);
  const apiError = wrappedApiError ?? rawApiError;
  const httpStatus = readStatus(response?.status);

  if (apiError) {
    return { apiError, httpStatus };
  }

  // RTK FetchBaseQueryError shape: { status, data }
  const rtkDataError = readApiError(isObject(error.data) ? error.data.error ?? error.data : undefined);
  const rtkStatus = readStatus(error.status);
  if (rtkDataError) {
    return { apiError: rtkDataError, httpStatus: rtkStatus };
  }

  const fallbackMessage = typeof error.message === 'string' ? error.message : undefined;
  return { httpStatus: httpStatus ?? rtkStatus, fallbackMessage };
}

