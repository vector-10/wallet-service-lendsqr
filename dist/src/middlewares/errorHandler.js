"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const utils_1 = require("../utils");
const errors_1 = require("../utils/errors");
const errorHandler = (err, _req, res, _next) => {
    console.error(err.stack);
    const statusCode = err instanceof errors_1.AppError ? err.statusCode : 500;
    (0, utils_1.sendError)(res, err.message || 'Internal server error', statusCode);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map