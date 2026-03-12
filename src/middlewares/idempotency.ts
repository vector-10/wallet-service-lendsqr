import { Request, Response, NextFunction } from "express"
import db from "../config/database"
import { sendError } from "../utils"

export const idempotency = async (req: Request, res: Response, next: NextFunction) => {
    const key = req.headers["idempotency-key"] as string

    if (!key) {
        sendError(res, "Idempotency-Key header is required", 400)
        return
    }

    const userId = req.user!.id

    const existing = await db("idempotency_keys")
        .where({ user_id: userId, key })
        .first()

    if (existing) {
        if (new Date() < new Date(existing.expires_at)) {
            res.status(existing.response_status).json(JSON.parse(existing.response_body))
            return
        }
        await db("idempotency_keys").where({ id: existing.id }).delete()
    }

    const originalJson = res.json.bind(res)

    res.json = function (body) {
        db("idempotency_keys").insert({
            user_id: userId,
            key,
            response_status: res.statusCode,
            response_body: JSON.stringify(body),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }).catch(() => {})

        return originalJson(body)
    }

    next()
}
