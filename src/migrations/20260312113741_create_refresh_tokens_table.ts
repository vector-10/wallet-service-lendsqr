import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("refresh_tokens", (table) => {
        table.bigIncrements("id").primary()
        table.bigInteger("user_id").unsigned().notNullable()
        table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE")
        table.string("token_hash", 255).notNullable().unique()
        table.timestamp("expires_at").notNullable()
        table.boolean("is_revoked").defaultTo(false)
        table.timestamp("created_at").defaultTo(knex.fn.now())
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("refresh_tokens")
}
