import { z } from "zod"

export const RegisterSchema = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.email(),
    bvn: z.string().length(11),
    phone: z.string().min(10).max(15),
    password: z.string().min(6),
})

export const LoginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
})
