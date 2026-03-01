"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable('users', (table) => {
        table.bigIncrements('id').unsigned().primary();
        table.string('first_name', 100).notNullable();
        table.string('last_name', 100).notNullable();
        table.string('email', 150).notNullable().unique();
        table.string('phone', 20).notNullable();
        table.string('password_hash', 255).notNullable();
        table.enum('status', ['active', 'blacklisted', 'suspended']).defaultTo('active');
        table.timestamp('karma_checked_at').nullable();
        table.timestamps(true, true);
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists('users');
}
//# sourceMappingURL=20260226082947_create_users_table.js.map