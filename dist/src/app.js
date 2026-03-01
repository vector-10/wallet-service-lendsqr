"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const validateEnv_1 = require("./utils/validateEnv");
(0, validateEnv_1.validateEnv)();
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const middlewares_1 = require("./middlewares");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: true,
        message: 'Demo Credit Wallet Service is running',
        timestamp: new Date().toISOString(),
    });
});
app.use('/api/v1', routes_1.default);
app.use((_req, res) => {
    res.status(404).json({
        status: false,
        message: 'Route not found',
    });
});
app.use(middlewares_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map