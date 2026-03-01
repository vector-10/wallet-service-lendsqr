"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: (process.env.JWT_EXPIRES_IN || '24h'),
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (typeof decoded === 'string' || !('id' in decoded) || !('email' in decoded)) {
        throw new Error('Invalid token payload');
    }
    return decoded;
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=token.js.map