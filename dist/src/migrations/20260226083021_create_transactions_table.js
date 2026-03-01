"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('transactions', (table) => {
        table.bigIncrements('id').unsigned().primary();
        table.string('reference', 100).notNullable().unique();
        table.bigInteger('source_wallet_id').unsigned().nullable();
        table.bigInteger('destination_wallet_id').unsigned().nullable();
        table.enum('type', ['fund', 'transfer', 'withdraw']).notNullable();
        table.decimal('amount', 15, 2).notNullable();
        table.enum('status', ['pending', 'success', 'failed']).defaultTo('pending');
        table.text('narration').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.foreign('source_wallet_id').references('id').inTable('wallets').onDelete('SET NULL');
        table.foreign('destination_wallet_id').references('id').inTable('wallets').onDelete('SET NULL');
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('transactions');
}
//# sourceMappingURL=20260226083021_create_transactions_table.js.map