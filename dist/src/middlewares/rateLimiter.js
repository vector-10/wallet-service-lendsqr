"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: {
        status: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimiter.js.map