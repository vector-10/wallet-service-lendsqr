"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallet_controller_1 = __importDefault(require("../controllers/wallet.controller"));
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.use(middlewares_1.authenticate);
router.get('/balance', wallet_controller_1.default.getBalance);
router.post('/fund', wallet_controller_1.default.fundWallet);
router.post('/transfer', wallet_controller_1.default.transfer);
router.post('/withdraw', wallet_controller_1.default.withdraw);
router.get('/transactions', wallet_controller_1.default.getTransactions);
exports.default = router;
//# sourceMappingURL=wallet.routes.js.map