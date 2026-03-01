import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('wallets', (table) => {
    table.unique(['user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('wallets', (table) => {
    table.dropUnique(['user_id']);
  });
}
