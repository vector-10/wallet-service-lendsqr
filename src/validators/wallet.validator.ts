import { z } from "zod"

export const FundWalletSchema = z.object({
    amount: z.number().positive(),
})

export const TransferSchema = z.object({
    receiver_account_number: z.string().length(10),
    amount: z.number().positive(),
})

export const WithdrawSchema = z.object({
    amount: z.number().positive(),
})
