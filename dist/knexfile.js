"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    development: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        },
        migrations: {
            directory: './src/migrations',
            extension: 'ts',
        },
    },
    test: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: `${process.env.DB_NAME}_test`,
        },
        migrations: {
            directory: './src/migrations',
            extension: 'ts',
        },
    },
    production: {
        client: 'mysql2',
        connection: process.env.DATABASE_URL,
        migrations: {
            directory: './src/migrations',
            extension: 'ts',
        },
    },
};
exports.default = config;
//# sourceMappingURL=knexfile.js.map