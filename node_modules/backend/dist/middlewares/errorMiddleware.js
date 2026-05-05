"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const zod_1 = require("zod");
const AppError_1 = require("../errors/AppError");
function errorMiddleware(err, _req, res, _next) {
    if (err instanceof AppError_1.AppError) {
        return res.status(err.status).json({
            error: { code: err.code, message: err.message, details: err.details },
        });
    }
    // Handle Zod validation errors
    if (err instanceof zod_1.ZodError) {
        return res.status(422).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: err.flatten(),
            },
        });
    }
    // Handle unknown errors
    return res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
        },
    });
}
