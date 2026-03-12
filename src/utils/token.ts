import jwt, { SignOptions } from "jsonwebtoken";
import { AuthPayload } from "../types";

export const generateToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): AuthPayload => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

  if (typeof decoded === 'string' || !('id' in decoded) || !('email' in decoded)) {
    throw new Error('Invalid token payload');
  }

  return decoded as AuthPayload;
};

export const generateRefreshToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  });
};

export const verifyRefreshToken = (token: string): AuthPayload => {
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);

  if (typeof decoded === 'string' || !('id' in decoded) || !('email' in decoded)) {
    throw new Error('Invalid refresh token payload');
  }

  return decoded as AuthPayload;
}