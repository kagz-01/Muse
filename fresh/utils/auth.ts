import * as bcrypt from "bcrypt";
import { getCookies, setCookie } from "$std/http/cookie.ts";

const kv = await Deno.openKv(); // Connects to Deno Deploy KV automatically

// Sentinel ID used throughout the app to identify demo sessions.
// When any handler sees this ID, it returns template data instead of hitting the DB.
export const DEMO_USER_ID = "__demo__";

export function isDemoUser(userId: string | null): boolean {
  return userId === DEMO_USER_ID;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(8);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expireInMs = 7 * 24 * 60 * 60 * 1000;
  await kv.set(["sessions", sessionId], userId, { expireIn: expireInMs });
  return sessionId;
}

export async function getSessionUser(req: Request): Promise<string | null> {
  const cookies = getCookies(req.headers);

  // Demo session takes priority — checked before real KV lookup
  if (cookies["muse_demo_session"] === "1") {
    return DEMO_USER_ID;
  }

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
    sameSite: "Lax",
  });
}

export function setDemoCookie(headers: Headers) {
  setCookie(headers, {
    name: "muse_demo_session",
    value: "1",
    // Demo session lasts 2 hours
    maxAge: 2 * 60 * 60,
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  });
}

export function clearDemoCookie(headers: Headers) {
  setCookie(headers, {
    name: "muse_demo_session",
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  });
}
