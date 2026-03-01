"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.alterTable('users', (table) => {
        table.string('bvn', 255).notNullable().unique();
    });
}
async function down(knex) {
    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('bvn');
    });
}
//# sourceMappingURL=20260227083759_add_bvn_to_users.js.map