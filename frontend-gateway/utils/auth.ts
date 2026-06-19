import * as bcrypt from "bcrypt";
import { getCookies, setCookie } from "$std/http/cookie.ts";

const kv = await Deno.openKv(); // Connects to Deno Deploy KV automatically

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(8);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  // Store session in KV with an expiration of 7 days
  const expireInMs = 7 * 24 * 60 * 60 * 1000;
  await kv.set(["sessions", sessionId], userId, { expireIn: expireInMs });
  return sessionId;
}

export async function getSessionUser(req: Request): Promise<string | null> {
  const cookies = getCookies(req.headers);
  const sessionId = cookies["muse_session"];
  if (!sessionId) return null;

  const result = await kv.get<string>(["sessions", sessionId]);
  return result.value;
}

export function setSessionCookie(headers: Headers, sessionId: string) {
  setCookie(headers, {
    name: "muse_session",
    value: sessionId,
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
    httpOnly: true,
    secure: true, // Requires HTTPS in production
    sameSite: "Lax",
  });
}
