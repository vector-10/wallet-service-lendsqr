import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("idempotency_keys", (table) => {
        table.bigIncrements("id").primary()
        table.bigInteger("user_id").unsigned().notNullable()
        table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE")
        table.string("key", 255).notNullable()
        table.integer("response_status").notNullable()
        table.json("response_body").notNullable()
        table.timestamp("expires_at").notNullable()
        table.timestamp("created_at").defaultTo(knex.fn.now())
        table.unique(["user_id", "key"])
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("idempotency_keys")
}
