export declare class AppError extends Error {
    message: string;
    statusCode: number;
    constructor(message: string, statusCode: number);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class NotFoundError extends AppError {
    constructor(message: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
export declare class UnprocessableError extends AppError {
    constructor(message: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map