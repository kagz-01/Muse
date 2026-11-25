import { signal } from "@preact/signals";

const VAULT_KEY = "muse_master_vault_v1";
const UNLOCK_KEY = "muse_vault_unlocked_session_v1";

function safeSessionGet(key: string): string | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalGet(key: string): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export const isVaultUnlockedSignal = signal<boolean>(
  safeSessionGet(UNLOCK_KEY) === "true",
);

export const hasMasterPasswordSignal = signal<boolean>(
  !!safeLocalGet(VAULT_KEY),
);

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(
  password: string,
  salt?: string,
): Promise<string> {
  const s = salt || generateSalt();
  const encoder = new TextEncoder();
  const data = encoder.encode(s + password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest)).map((b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
  return `${s}$${hex}`;
}

export async function setupMasterVault(
  password: string,
  securityAnswer: string,
) {
  const hashedPass = await hashPassword(password);
  const hashedAnswer = await hashPassword(securityAnswer.toLowerCase().trim());
  localStorage.setItem(VAULT_KEY, `${hashedPass}|${hashedAnswer}`);
  hasMasterPasswordSignal.value = true;
  unlockVaultSession();
}

export async function attemptUnlockVault(password: string): Promise<boolean> {
  const stored = localStorage.getItem(VAULT_KEY);
  if (!stored) return false;

  const [passSection] = stored.split("|");
  const [salt] = passSection.split("$");
  const candidate = await hashPassword(password, salt);

  if (candidate === passSection) {
    unlockVaultSession();
    return true;
  }
  return false;
}

export async function recoverMasterVault(
  securityAnswer: string,
  newPassword: string,
): Promise<boolean> {
  const stored = localStorage.getItem(VAULT_KEY);
  if (!stored) return false;

  const parts = stored.split("|");
  if (parts.length < 2) return false; // Old vault without security answer

  const answerSection = parts[1];
  const [answerSalt] = answerSection.split("$");
  const candidateAnswer = await hashPassword(
    securityAnswer.toLowerCase().trim(),
    answerSalt,
  );

  if (candidateAnswer === answerSection) {
    // Answer is correct, setup new password
    const newHashedPass = await hashPassword(newPassword);
    localStorage.setItem(VAULT_KEY, `${newHashedPass}|${answerSection}`);
    unlockVaultSession();
    return true;
  }
  return false;
}

export function nukeVault() {
  localStorage.removeItem(VAULT_KEY);
  hasMasterPasswordSignal.value = false;
  lockVaultSession();
}

function unlockVaultSession() {
  isVaultUnlockedSignal.value = true;
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(UNLOCK_KEY, "true");
  }
}

export function lockVaultSession() {
  isVaultUnlockedSignal.value = false;
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(UNLOCK_KEY);
  }
}
