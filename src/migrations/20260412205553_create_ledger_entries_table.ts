import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("ledger_entries", (table) => {
        table.bigIncrements("id").primary()
        table.bigInteger("transaction_id").unsigned().notNullable()
        table.foreign("transaction_id").references("id").inTable("transactions").onDelete("RESTRICT")
        table.bigInteger("wallet_id").unsigned().nullable()
        table.foreign("wallet_id").references("id").inTable("wallets").onDelete("SET NULL")
        table.enu("entry_type", ["debit", "credit"]).notNullable()
        table.decimal("amount", 15, 2).notNullable()
        table.string("description", 255).nullable()
        table.timestamp("created_at").defaultTo(knex.fn.now())
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("ledger_entries")
}
