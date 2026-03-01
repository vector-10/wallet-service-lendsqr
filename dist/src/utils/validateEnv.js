"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
const REQUIRED_ENV_VARS = [
    'JWT_SECRET',
    'ADJUTOR_BASE_URL',
    'ADJUTOR_API_KEY',
    'ENCRYPTION_KEY',
];
function validateEnv() {
    const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}. ` +
            'Check your .env file against .env.example.');
    }
}
//# sourceMappingURL=validateEnv.js.map