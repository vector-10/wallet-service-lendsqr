"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const utils_1 = require("../utils");
const errors_1 = require("../utils/errors");
const adjutor_service_1 = __importDefault(require("./adjutor.service"));
class UserService {
    async findUserByEmail(email) {
        return (0, database_1.default)("users").where({ email }).first();
    }
    sanitizeUser(user) {
        const { password_hash, bvn, karma_checked_at, updated_at, ...safeUser } = user;
        return safeUser;
    }
    async register(data) {
        const existing = await this.findUserByEmail(data.email);
        if (existing)
            throw new errors_1.ConflictError('Email already in use');
        const isBlackListed = await adjutor_service_1.default.checkKarmaBlacklist(data.bvn);
        if (isBlackListed)
            throw new errors_1.UnprocessableError('Your identity has been flagged on the Lendsqr Karma blacklist. You cannot be onboarded.');
        const password_hash = await bcryptjs_1.default.hash(data.password, 10);
        const encrypted_bvn = (0, utils_1.encrypt)(data.bvn);
        const result = await database_1.default.transaction(async (trx) => {
            const [userId] = await trx('users').insert({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                bvn: encrypted_bvn,
                phone: data.phone,
                password_hash,
                status: 'active',
                karma_checked_at: new Date(),
            });
            await trx('wallets').insert({
                user_id: userId,
                balance: 0.0,
                currency: 'NGN',
            });
            const user = await trx('users').where({ id: userId }).first();
            if (!user)
                throw new errors_1.AppError('Failed to create account', 500);
            const token = (0, utils_1.generateToken)({ id: user.id, email: user.email });
            return { user: this.sanitizeUser(user), token };
        });
        return result;
    }
    async login(data) {
        const user = await this.findUserByEmail(data.email);
        if (!user)
            throw new errors_1.ValidationError("Invalid credentials");
        if (user.status === "blacklisted")
            throw new errors_1.ForbiddenError("Account is blacklisted");
        if (user.status === "suspended")
            throw new errors_1.ForbiddenError("Account is suspended");
        const isMatch = await bcryptjs_1.default.compare(data.password, user.password_hash);
        if (!isMatch)
            throw new errors_1.ValidationError("Invalid credentials");
        const token = (0, utils_1.generateToken)({ id: user.id, email: user.email });
        return { user: this.sanitizeUser(user), token };
    }
}
exports.default = new UserService();
//# sourceMappingURL=user.service.js.map