import {
  admin,
  dispatcher,
  hashPassword,
  signPortalToken,
  userClient,
  verifyPasswordHash,
  verifyPortalToken,
  type Portal,
} from "../_shared/madad.ts";

const DEFAULT_PORTAL_PASSWORDS: Record<Portal, string> = {
  admin: "madad-admin",
  events: "madad-events",
  auditing: "madad-auditing",
};

const PORTAL_ENV: Record<Portal, string> = {
  admin: "ADMIN_PORTAL_PASSWORD",
  events: "EVENTS_PORTAL_PASSWORD",
  auditing: "AUDITING_PORTAL_PASSWORD",
};

async function readStoredHash(
  portal: "events" | "auditing",
): Promise<string | null> {
  const { data } = await admin()
    .from("portal_passwords")
    .select("password_hash")
    .eq("portal", portal)
    .maybeSingle();
  return (data?.password_hash as string | null) ?? null;
}

async function callerIsAdmin(req: Request): Promise<{ userId: string }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Sign in required");
  const sb = userClient(authHeader);
  const { data: ures, error: uerr } = await sb.auth.getUser();
  if (uerr || !ures?.user) throw new Error("Sign in required");
  const userId = ures.user.id;
  const { data: ok, error } = await sb.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!ok) throw new Error("Forbidden: admin role required");
  return { userId };
}

Deno.serve(
  dispatcher({
    // Events / Auditing portal password verification (password-only).
    async verifyPortalPassword(data) {
      const portal = data.portal as "events" | "auditing";
      if (portal !== "events" && portal !== "auditing")
        throw new Error("Invalid portal");
      const password = String(data.password || "");
      if (!password) throw new Error("Password required");

      const stored = await readStoredHash(portal);
      let ok = false;
      if (stored) {
        ok = await verifyPasswordHash(password, stored);
      } else {
        const expected =
          Deno.env.get(PORTAL_ENV[portal]) ??
          DEFAULT_PORTAL_PASSWORDS[portal];
        ok = password.trim() === expected.trim();
      }
      if (!ok) return { ok: false, error: "Incorrect password" };
      const token = signPortalToken(portal, data.wing || null);
      return { ok: true, token };
    },

    // Admin: requires a signed-in user with role=admin. Returns a portal
    // token in the same shape consumed by the other edge functions.
    async issueAdminToken(_data, req) {
      await callerIsAdmin(req);
      const token = signPortalToken("admin", null);
      return { ok: true, token };
    },

    // Admin-only: rotate the password for an Events/Auditing portal.
    async setPortalPassword(data, req) {
      const { userId } = await callerIsAdmin(req);
      const portal = data.portal as "events" | "auditing";
      if (portal !== "events" && portal !== "auditing")
        throw new Error("Invalid portal");
      const newPassword = String(data.newPassword || "");
      if (newPassword.length < 6)
        throw new Error("Password must be at least 6 characters");
      const hash = await hashPassword(newPassword);
      const { error } = await admin().from("portal_passwords").upsert({
        portal,
        password_hash: hash,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
      return { ok: true };
    },

    // Token-authenticated announcement create (admin portal).
    async createAnnouncementWithToken(data) {
      const auth = verifyPortalToken(data.token, ["admin"]);
      if (!auth) throw new Error("Unauthorized");
      const { error } = await admin().from("announcements").insert({
        title: String(data.title || "").trim(),
        body: String(data.body || "").trim(),
        wing: data.wing || null,
      });
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async deleteAnnouncementWithToken(data) {
      const auth = verifyPortalToken(data.token, ["admin"]);
      if (!auth) throw new Error("Unauthorized");
      const { error } = await admin().from("announcements").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
  }),
);
