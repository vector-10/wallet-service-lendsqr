import { Request, Response } from "express";
import {
  verifyRefreshToken,
  generateToken,
  generateRefreshToken,
} from "../utils";
import tokenService from "../services/token.service";
import { sendSuccess, sendError, asyncHandler } from "../utils";
import { AppError } from "../utils/errors";



class TokenController {
  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      sendError(res, "Refresh token is required", 400);
      return;
    }

    const payload = verifyRefreshToken(refresh_token);

    const new_access_token = generateToken({
      id: payload.id,
      email: payload.email,
    });
    const new_refresh_token = generateRefreshToken({
      id: payload.id,
      email: payload.email,
    });

    await tokenService.rotateRefreshToken(
      refresh_token,
      payload.id,
      new_refresh_token,
    );

    sendSuccess(res, "Token refreshed", {
      access_token: new_access_token,
      refresh_token: new_refresh_token,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      sendError(res, "Refresh token is required", 400);
      return;
    }

    const payload = verifyRefreshToken(refresh_token);
    await tokenService.revokeRefreshToken(refresh_token, payload.id);

    sendSuccess(res, "Logged out successfully");
  });
}

export default new TokenController();
