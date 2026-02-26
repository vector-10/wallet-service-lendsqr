import jwt from "jsonwebtoken";
import { AuthPayload } from "../types";

export const generateToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, process.env.JWTSECRET as string, {
    expiresIn: "24h",
  });
};

export const verifyToken = (token: string): AuthPayload => {
    return jwt.verify(token, process.env.JWTSECRET as string) as AuthPayload;
}