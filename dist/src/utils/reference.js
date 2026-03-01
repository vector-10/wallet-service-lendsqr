"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReference = void 0;
const uuid_1 = require("uuid");
const generateReference = () => {
    return `TXN-${(0, uuid_1.v4)()}`;
};
exports.generateReference = generateReference;
//# sourceMappingURL=reference.js.map