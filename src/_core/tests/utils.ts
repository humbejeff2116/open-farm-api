import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || "test-secret");

export async function makeJwt(payload: Record<string, any>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}
