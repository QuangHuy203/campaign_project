export type AppErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(args: { code: AppErrorCode; message: string; status: number; details?: unknown }) {
    super(args.message);
    this.code = args.code;
    this.status = args.status;
    this.details = args.details;
  }
}

export function badRequest(message: string, details?: unknown) {
  return new AppError({ code: 'BAD_REQUEST', message, status: 400, details });
}

export function unauthorized(message = 'Unauthorized') {
  return new AppError({ code: 'UNAUTHORIZED', message, status: 401 });
}

export function forbidden(message = 'Forbidden') {
  return new AppError({ code: 'FORBIDDEN', message, status: 403 });
}

export function notFound(message = 'Not found') {
  return new AppError({ code: 'NOT_FOUND', message, status: 404 });
}

export function conflict(message: string, details?: unknown) {
  return new AppError({ code: 'CONFLICT', message, status: 409, details });
}

export function validationError(message: string, details?: unknown) {
  return new AppError({ code: 'VALIDATION_ERROR', message, status: 422, details });
}

