"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
router.post('/register', rateLimiter_1.authLimiter, user_controller_1.default.register);
router.post('/login', rateLimiter_1.authLimiter, user_controller_1.default.login);
exports.default = router;
//# sourceMappingURL=user.routes.js.map