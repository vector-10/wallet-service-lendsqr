"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.alterTable('wallets', (table) => {
        table.unique(['user_id']);
    });
}
async function down(knex) {
    await knex.schema.alterTable('wallets', (table) => {
        table.dropUnique(['user_id']);
    });
}
//# sourceMappingURL=20260301000001_add_unique_user_id_to_wallets.js.map