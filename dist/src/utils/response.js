"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, message, data, statusCode = 200) => {
    const response = { status: true, message, data };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 400) => {
    const response = { status: false, message };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
//# sourceMappingURL=response.js.map