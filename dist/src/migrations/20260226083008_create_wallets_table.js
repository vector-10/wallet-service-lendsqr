"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('wallets', (table) => {
        table.bigIncrements('id').unsigned().primary();
        table.bigInteger('user_id').unsigned().notNullable();
        table.decimal('balance', 15, 2).defaultTo(0.00);
        table.string('currency', 10).defaultTo('NGN');
        table.timestamps(true, true);
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('wallets');
}
//# sourceMappingURL=20260226083008_create_wallets_table.js.map