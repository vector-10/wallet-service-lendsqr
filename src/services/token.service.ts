import db from "../config/database"
import crypto from "crypto"
import { RefreshToken } from "../types"
import { AppError } from "../utils/errors"

class TokenService {
  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex")
  }

  async saveRefreshToken(userId: number, token: string): Promise<void> {
    const token_hash = this.hashToken(token)
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await db("refresh_tokens").insert({
      user_id: userId,
      token_hash,
      expires_at,
    })
  }

  async rotateRefreshToken(oldToken: string, userId: number, newToken: string): Promise<void> {
    const old_hash = this.hashToken(oldToken)

    const stored = await db<RefreshToken>("refresh_tokens")
      .where({ user_id: userId, token_hash: old_hash, is_revoked: false })
      .first()

    if (!stored) throw new AppError("Invalid or expired refresh token", 401)
    if (new Date() > new Date(stored.expires_at)) throw new AppError("Refresh token expired", 401)

    await db("refresh_tokens").where({ id: stored.id }).delete()
    await this.saveRefreshToken(userId, newToken)
  }

  async revokeRefreshToken(token: string, userId: number): Promise<void> {
    const token_hash = this.hashToken(token)
    await db("refresh_tokens").where({ user_id: userId, token_hash }).delete()
  }
}

export default new TokenService()
