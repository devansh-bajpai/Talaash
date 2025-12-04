// frontend/lib/auth.ts
import { SignJWT, jwtVerify } from "jose";

const SECRET = process.env.AUTH_SECRET || "dev-secret-key-change-me";
const secretKey = new TextEncoder().encode(SECRET);

export async function generateToken(userId: number) {
  return await new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("60m")
    .sign(secretKey);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey);
  return payload; // contains { sub, exp, iat }
}
