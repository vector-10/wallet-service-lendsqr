import { Knex } from "knex";

export async function generateAccountNumber(db: Knex): Promise<string> {
  while (true) {
    const randomNineDigits = Math.floor(Math.random() * 1_000_000_000);
    const candidate = "4" + randomNineDigits.toString().padStart(9, "0");

    const existing = await db("wallets")
      .where("account_number", candidate)
      .first();
    if (!existing) {
      return candidate;
    }
  }
}
