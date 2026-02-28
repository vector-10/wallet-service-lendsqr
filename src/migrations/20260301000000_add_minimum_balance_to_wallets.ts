import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('wallets', (table) => {
    table.decimal('minimum_balance', 15, 2).notNullable().defaultTo(100.00);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('wallets', (table) => {
    table.dropColumn('minimum_balance');
  });
}
