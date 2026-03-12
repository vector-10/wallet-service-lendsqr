import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("wallets", (table) => {
        table.string("account_number", 10).notNullable().defaultTo("")
    })

    const wallets = await knex("wallets").select("id")

    for (const wallet of wallets) {
        let accountNumber: string
        while (true) {
            const randomNineDigits = Math.floor(Math.random() * 1_000_000_000)
            const candidate = "4" + randomNineDigits.toString().padStart(9, "0")
            const existing = await knex("wallets").where("account_number", candidate).first()
            if (!existing) {
                accountNumber = candidate
                break
            }
        }
        await knex("wallets").where("id", wallet.id).update({ account_number: accountNumber })
    }

    await knex.schema.alterTable("wallets", (table) => {
        table.unique(["account_number"])
    })
}



export async function down(knex: Knex): Promise<void> {
    await knex.schema.table("wallets", (table) => {
        table.dropColumn("account_number");
    })
}

