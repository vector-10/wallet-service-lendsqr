"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.alterTable('wallets', (table) => {
        table.decimal('minimum_balance', 15, 2).notNullable().defaultTo(100.00);
    });
}
async function down(knex) {
    await knex.schema.alterTable('wallets', (table) => {
        table.dropColumn('minimum_balance');
    });
}
//# sourceMappingURL=20260301000000_add_minimum_balance_to_wallets.js.map