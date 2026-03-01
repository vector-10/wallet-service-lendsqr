"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
const response_1 = require("./response");
const errors_1 = require("./errors");
const asyncHandler = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        }
        catch (error) {
            const statusCode = error instanceof errors_1.AppError ? error.statusCode : 400;
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            (0, response_1.sendError)(res, message, statusCode);
        }
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=asyncHandler.js.map