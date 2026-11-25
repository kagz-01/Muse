import { compare, hash } from "bcryptjs";
import { parse, serialize } from "cookie";
import process from "node:process";
import { executeDB, queryDB } from "./db";

export const DEMO_USER_ID = "__demo__";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_COOKIE = "muse_session";
const DEMO_COOKIE = "muse_demo_session";

export function isDemoUser(userId: string | null): boolean {
  return userId === DEMO_USER_ID;
}

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 8);
}

export async function comparePassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return await compare(password, passwordHash);
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await executeDB(
    `INSERT INTO app_sessions (id, user_id, expires_at)
     VALUES ($1, $2, $3)`,
    sessionId,
    userId,
    expiresAt,
  );
  return sessionId;
}

export async function getSessionUser(req: Request): Promise<string | null> {
  const cookies = parse(req.headers.get("cookie") ?? "");

  if (cookies[DEMO_COOKIE] === "1") {
    return DEMO_USER_ID;
  }

  const sessionId = cookies[SESSION_COOKIE];
  if (!sessionId) return null;

  const rows = await queryDB<{ user_id: string }>(
    `SELECT user_id
     FROM app_sessions
     WHERE id = $1 AND expires_at > NOW()`,
    sessionId,
  );
  return rows[0]?.user_id ?? null;
}

function appendCookie(
  headers: Headers,
  name: string,
  value: string,
  maxAge: number,
): void {
  headers.append(
    "Set-Cookie",
    serialize(name, value, {
      httpOnly: true,
      maxAge,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    }),
  );
}

export function setSessionCookie(headers: Headers, sessionId: string): void {
  appendCookie(headers, SESSION_COOKIE, sessionId, SESSION_TTL_MS / 1000);
}

export function clearSessionCookie(headers: Headers): void {
  appendCookie(headers, SESSION_COOKIE, "", 0);
}

export function setDemoCookie(headers: Headers): void {
  appendCookie(headers, DEMO_COOKIE, "1", 2 * 60 * 60);
}

export function clearDemoCookie(headers: Headers): void {
  appendCookie(headers, DEMO_COOKIE, "", 0);
}

export async function removeSession(req: Request): Promise<void> {
  const sessionId = parse(req.headers.get("cookie") ?? "")[SESSION_COOKIE];
  if (!sessionId) return;

  await executeDB("DELETE FROM app_sessions WHERE id = $1", sessionId);
}
