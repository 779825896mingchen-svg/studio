import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export type LocalAccount = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: "admin" | "customer";
  password: {
    salt: string;
    hash: string;
  };
  createdAt: string;
};

export type LocalSession = {
  token: string;
  accountId: string;
  createdAt: string;
  expiresAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");
const ACCOUNTS_TXT_FILE = path.join(DATA_DIR, "accounts.txt");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const RESET_CODES_FILE = path.join(DATA_DIR, "password-resets.json");
const OUTBOX_DIR = path.join(DATA_DIR, "outbox");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(OUTBOX_DIR, { recursive: true });
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (e) {
    return null;
  }
}

async function writeJsonFile(filePath: string, value: unknown) {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

function hashPassword(password: string, salt: string) {
  return crypto.createHash("sha256").update(salt + password).digest("hex");
}

function formatAccountsTxt(accounts: LocalAccount[]) {
  // Simple plain-text export so you can open it in Notepad.
  return accounts
    .map((a) => `Name: ${a.name}\nEmail: ${a.email}\nPhone: ${a.phone || "—"}\nCreated: ${formatToEST(a.createdAt)}\n---`)
    .join("\n");
}

export function formatToEST(dateInput: string | number | Date) {
  const date = new Date(dateInput);
  return date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}

export function normalizePhoneDigits(phone: string) {
  return phone.replace(/\D/g, "").slice(0, 10);
}

export async function getAccounts(): Promise<LocalAccount[]> {
  await ensureDataDir();
  const accounts = await readJsonFile<LocalAccount[]>(ACCOUNTS_FILE);
  if (!Array.isArray(accounts)) return [];
  return accounts.map((a) => ({
    ...a,
    role: a.role === "admin" ? "admin" : "customer",
    phone: a.phone || "",
  }));
}

export async function saveAccounts(accounts: LocalAccount[]) {
  await ensureDataDir();
  await writeJsonFile(ACCOUNTS_FILE, accounts);
  await fs.writeFile(ACCOUNTS_TXT_FILE, formatAccountsTxt(accounts), "utf8");
}

export async function getSessions(): Promise<LocalSession[]> {
  await ensureDataDir();
  const sessions = await readJsonFile<LocalSession[]>(SESSIONS_FILE);
  return Array.isArray(sessions) ? sessions : [];
}

export async function saveSessions(sessions: LocalSession[]) {
  await ensureDataDir();
  await writeJsonFile(SESSIONS_FILE, sessions);
}

export function createPasswordHash(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string) {
  const hash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
}

export async function upsertAccount(account: LocalAccount) {
  const accounts = await getAccounts();
  const normalizedEmail = account.email.trim().toLowerCase();
  const normalizedPhone = normalizePhoneDigits(account.phone || "");
  const idx = accounts.findIndex((a) => a.email.trim().toLowerCase() === normalizedEmail);
  if (idx >= 0) {
    accounts[idx] = {
      ...account,
      email: normalizedEmail,
      phone: normalizedPhone,
      role: account.role === "admin" ? "admin" : "customer",
    };
  } else {
    accounts.unshift({
      ...account,
      email: normalizedEmail,
      phone: normalizedPhone,
      role: account.role === "admin" ? "admin" : "customer",
    });
  }
  await saveAccounts(accounts);
}

export async function getAccountByEmail(email: string) {
  const accounts = await getAccounts();
  const normalizedEmail = email.trim().toLowerCase();
  return accounts.find((a) => a.email.trim().toLowerCase() === normalizedEmail) ?? null;
}

export async function getAccountByPhone(phone: string) {
  const accounts = await getAccounts();
  const normalizedPhone = normalizePhoneDigits(phone);
  return accounts.find((a) => normalizePhoneDigits(a.phone || "") === normalizedPhone) ?? null;
}

export async function getAccountByIdentifier(identifier: string) {
  const byEmail = await getAccountByEmail(identifier);
  if (byEmail) return byEmail;
  return getAccountByPhone(identifier);
}

export async function updateAccountPassword(accountId: string, newPassword: string) {
  const accounts = await getAccounts();
  const idx = accounts.findIndex((a) => a.id === accountId);
  if (idx < 0) return false;
  const password = createPasswordHash(newPassword);
  accounts[idx] = { ...accounts[idx], password };
  await saveAccounts(accounts);
  return true;
}

export async function ensureAdminAccount() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin123@gmail.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123.";
  const existing = await getAccountByEmail(adminEmail);
  if (existing) {
    if (existing.role !== "admin") {
      await upsertAccount({ ...existing, role: "admin" });
    }
    return;
  }

  await upsertAccount({
    id: crypto.randomUUID(),
    name: "Admin",
    email: adminEmail,
    phone: "",
    role: "admin",
    password: createPasswordHash(adminPassword),
    createdAt: new Date().toISOString(),
  });
}

export type PasswordResetCode = {
  id: string;
  accountId: string;
  identifier: string;
  channel: "email" | "phone";
  code: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
};

export async function getResetCodes(): Promise<PasswordResetCode[]> {
  await ensureDataDir();
  const codes = await readJsonFile<PasswordResetCode[]>(RESET_CODES_FILE);
  return Array.isArray(codes) ? codes : [];
}

export async function saveResetCodes(codes: PasswordResetCode[]) {
  await ensureDataDir();
  await writeJsonFile(RESET_CODES_FILE, codes);
}

export function createResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function storeResetDelivery(params: {
  channel: "email" | "phone";
  destination: string;
  code: string;
  accountName?: string;
}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  if (params.channel === "email") {
    const html = `<!doctype html>
<html>
  <body style="font-family: Inter, Arial, sans-serif; background:#f6f6f7; padding:24px;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #ececf0;">
      <div style="background:#f97316; color:#fff; padding:20px 24px; font-weight:700; font-size:20px;">Emperor's Choice</div>
      <div style="padding:24px;">
        <p style="margin:0 0 12px 0; color:#111827;">Hi ${params.accountName || "there"},</p>
        <p style="margin:0 0 16px 0; color:#374151;">Use this verification code to reset your password:</p>
        <div style="font-size:32px; font-weight:800; letter-spacing:6px; color:#f97316; margin:8px 0 16px 0;">${params.code}</div>
        <p style="margin:0; color:#6b7280;">This code expires in 10 minutes.</p>
      </div>
    </div>
  </body>
</html>`;
    const filePath = path.join(OUTBOX_DIR, `email-${timestamp}.html`);
    await fs.writeFile(filePath, html, "utf8");
    return;
  }

  const message = `Emperor's Choice password reset code: ${params.code}. Expires in 10 minutes.`;
  const filePath = path.join(OUTBOX_DIR, `sms-${timestamp}.txt`);
  await fs.writeFile(filePath, `To: ${params.destination}\n${message}\n`, "utf8");
}

export async function getAccountById(id: string) {
  const accounts = await getAccounts();
  return accounts.find((a) => a.id === id) ?? null;
}

export function createSessionToken() {
  return crypto.randomBytes(24).toString("hex");
}

export async function deleteSessionToken(token: string) {
  const sessions = await getSessions();
  const next = sessions.filter((s) => s.token !== token);
  await saveSessions(next);
}

