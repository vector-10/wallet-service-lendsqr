import jwt, { SignOptions } from "jsonwebtoken";
import { AuthPayload } from "../types";

export const generateToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): AuthPayload => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

  if (typeof decoded === 'string' || !('id' in decoded) || !('email' in decoded)) {
    throw new Error('Invalid token payload');
  }

  return decoded as AuthPayload;
};