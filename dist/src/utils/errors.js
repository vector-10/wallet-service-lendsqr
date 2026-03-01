"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.UnprocessableError = exports.ConflictError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.name = 'AppError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class UnprocessableError extends AppError {
    constructor(message) {
        super(message, 422);
        this.name = 'UnprocessableError';
    }
}
exports.UnprocessableError = UnprocessableError;
class ForbiddenError extends AppError {
    constructor(message) {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
//# sourceMappingURL=errors.js.map