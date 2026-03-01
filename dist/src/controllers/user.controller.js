"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../services/user.service"));
const utils_1 = require("../utils");
class UserController {
    constructor() {
        this.register = (0, utils_1.asyncHandler)(async (req, res) => {
            const { first_name, last_name, email, bvn, phone, password } = req.body;
            if (!first_name || !last_name || !email || !bvn || !phone || !password) {
                (0, utils_1.sendError)(res, 'All fields are required', 400);
                return;
            }
            const result = await user_service_1.default.register({ first_name, last_name, email, bvn, phone, password });
            (0, utils_1.sendSuccess)(res, 'Account created successfully', result, 201);
        });
        this.login = (0, utils_1.asyncHandler)(async (req, res) => {
            const { email, password } = req.body;
            if (!email || !password) {
                (0, utils_1.sendError)(res, 'Email and password are required', 400);
                return;
            }
            const result = await user_service_1.default.login({ email, password });
            (0, utils_1.sendSuccess)(res, 'Login successful', result);
        });
    }
}
exports.default = new UserController();
//# sourceMappingURL=user.controller.js.map