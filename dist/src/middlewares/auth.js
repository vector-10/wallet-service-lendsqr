"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const utils_1 = require("../utils");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (0, utils_1.sendError)(res, 'No token provided', 401);
            return;
        }
        const token = authHeader.slice(7);
        const decoded = (0, utils_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        (0, utils_1.sendError)(res, 'Invalid or expired token', 401);
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map