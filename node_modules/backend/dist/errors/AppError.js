"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.badRequest = badRequest;
exports.unauthorized = unauthorized;
exports.forbidden = forbidden;
exports.notFound = notFound;
exports.conflict = conflict;
exports.validationError = validationError;
class AppError extends Error {
    constructor(args) {
        super(args.message);
        this.code = args.code;
        this.status = args.status;
        this.details = args.details;
    }
}
exports.AppError = AppError;
function badRequest(message, details) {
    return new AppError({ code: 'BAD_REQUEST', message, status: 400, details });
}
function unauthorized(message = 'Unauthorized') {
    return new AppError({ code: 'UNAUTHORIZED', message, status: 401 });
}
function forbidden(message = 'Forbidden') {
    return new AppError({ code: 'FORBIDDEN', message, status: 403 });
}
function notFound(message = 'Not found') {
    return new AppError({ code: 'NOT_FOUND', message, status: 404 });
}
function conflict(message, details) {
    return new AppError({ code: 'CONFLICT', message, status: 409, details });
}
function validationError(message, details) {
    return new AppError({ code: 'VALIDATION_ERROR', message, status: 422, details });
}
