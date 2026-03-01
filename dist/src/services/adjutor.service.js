"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const errors_1 = require("../utils/errors");
class AdjutorService {
    constructor() {
        this.baseUrl = process.env.ADJUTOR_BASE_URL;
        this.apiKey = process.env.ADJUTOR_API_KEY;
    }
    get headers() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
        };
    }
    async checkKarmaBlacklist(bvn) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/verification/karma/${bvn}`, { headers: this.headers });
            if (response.data?.["mock-response"])
                return false;
            return response.data?.data !== null && response.data?.data !== undefined;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404)
                return false;
            throw new errors_1.AppError("Identity verification failed. Please try again later or contact support.", 503);
        }
    }
}
exports.default = new AdjutorService();
//# sourceMappingURL=adjutor.service.js.map