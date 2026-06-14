// Shared helpers for MADAD edge functions.
// Re-implements the existing HMAC token format and scrypt password format
// so existing stored hashes and any active portal tokens keep working.
//
// Token format: base64url(payload) + "." + hex(hmac_sha256(payload, secret))
// payload format: `${portal}.${exp_ms}.${wing||""}`
//
// Password hash format: `scrypt$<saltHex>$<keyHex>`  (N=16384,r=8,p=1, keyLen=64)
// We use Node's `node:crypto` which is available in Supabase Edge Runtime.

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { Buffer } from "node:buffer";

export type Portal = "admin" | "events" | "auditing";

export const CORS_HEADERS: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

export function ok(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json" },
  });
}

export function fail(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json" },
  });
}

export function handleOptions(req: Request) {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: CORS_HEADERS });
  return null;
}

// ---------- supabase admin client (service role; bypasses RLS) ----------
let _admin: SupabaseClient | null = null;
export function admin(): SupabaseClient {
  if (_admin) return _admin;
  const url =
    Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL") ?? "";
  const key =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("MADAD_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) throw new Error("Supabase service config missing");
  _admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}

// User-scoped client (validates the caller's Supabase Auth bearer).
export function userClient(authHeader: string | null): SupabaseClient {
  const url =
    Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL") ?? "";
  const anon =
    Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
    Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? "";
  if (!url || !anon) throw new Error("Supabase public config missing");
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: authHeader ? { Authorization: authHeader } : {} },
  });
}

// ---------- portal token (HMAC) ----------
export function getPortalTokenSecret(): string {
  return (
    Deno.env.get("PORTAL_TOKEN_SECRET") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("MADAD_SERVICE_ROLE_KEY") ??
    Deno.env.get("ADMIN_PORTAL_PASSWORD") ??
    Deno.env.get("EVENTS_PORTAL_PASSWORD") ??
    Deno.env.get("AUDITING_PORTAL_PASSWORD") ??
    "madad-portal-token-secret-v1"
  );
}

export function signPortalToken(portal: Portal, wing: string | null): string {
  const secret = getPortalTokenSecret();
  const exp = Date.now() + 1000 * 60 * 60 * 24; // 24h
  const payload = `${portal}.${exp}.${wing || ""}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifyPortalToken(
  token: string,
  allowed: Portal[],
): { portal: Portal; wing: string | null } | null {
  try {
    const [b64, sig] = token.split(".");
    if (!b64 || !sig) return null;
    const payload = Buffer.from(b64, "base64url").toString("utf8");
    const parts = payload.split(".");
    const portal = parts[0] as Portal;
    if (!allowed.includes(portal)) return null;
    const exp = Number(parts[1]);
    const wing = parts[2] || null;
    if (!Number.isFinite(exp) || exp < Date.now()) return null;
    const secret = getPortalTokenSecret();
    const want = createHmac("sha256", secret).update(payload).digest("hex");
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(want, "hex");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    return { portal, wing };
  } catch {
    return null;
  }
}

export function requireToken(
  token: string,
  allowed: Portal[],
): { portal: Portal; wing: string | null } {
  const auth = verifyPortalToken(token, allowed);
  if (!auth) throw new Error("Unauthorized");
  return auth;
}

// ---------- scrypt password hashing (matches existing stored format) ----------
function scrypt(password: string, salt: Buffer, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password.normalize("NFKC"), salt, keylen, (err, dk) =>
      err ? reject(err) : resolve(dk as Buffer),
    ),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPasswordHash(
  password: string,
  stored: string,
): Promise<boolean> {
  try {
    const [scheme, saltHex, keyHex] = stored.split("$");
    if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(keyHex, "hex");
    const got = await scrypt(password, salt, expected.length);
    if (got.length !== expected.length) return false;
    return timingSafeEqual(got, expected);
  } catch {
    return false;
  }
}

// ---------- dispatcher boilerplate ----------
export type Action<T = any> = (data: any, req: Request) => Promise<T> | T;

export function dispatcher(actions: Record<string, Action>) {
  return async (req: Request): Promise<Response> => {
    const opt = handleOptions(req);
    if (opt) return opt;
    if (req.method !== "POST") return fail("Method not allowed", 405);
    let body: any;
    try {
      body = await req.json();
    } catch {
      return fail("Invalid JSON body");
    }
    const action = body?.action;
    const data = body?.data ?? {};
    if (!action || typeof action !== "string")
      return fail("Missing action");
    const fn = actions[action];
    if (!fn) return fail(`Unknown action: ${action}`, 404);
    try {
      const result = await fn(data, req);
      return ok(result ?? { ok: true });
    } catch (err: any) {
      const msg = err?.message || "Internal error";
      const status = /unauthorized|forbidden/i.test(msg) ? 401 : 400;
      return fail(msg, status);
    }
  };
}
