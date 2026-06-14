import { admin, dispatcher, requireToken, type Portal } from "../_shared/madad.ts";
import { Buffer } from "node:buffer";

const ALLOWED_BUCKETS = [
  "posters",
  "stationery",
  "reports",
  "gallery",
  "results",
  "documents",
] as const;
type Bucket = (typeof ALLOWED_BUCKETS)[number];

function allowedPortalsFor(bucket: Bucket): Portal[] {
  switch (bucket) {
    case "stationery":
      return ["admin"];
    case "reports":
      return ["admin", "auditing"];
    case "gallery":
      return ["admin", "events"];
    case "results":
      return ["admin", "events"];
    case "documents":
      return ["admin", "events", "auditing"];
    case "posters":
    default:
      return ["admin", "events"];
  }
}

Deno.serve(
  dispatcher({
    async uploadFile(data) {
      const bucket = data.bucket as Bucket;
      if (!ALLOWED_BUCKETS.includes(bucket)) throw new Error("Invalid bucket");
      requireToken(data.token, allowedPortalsFor(bucket));

      const buf = Buffer.from(String(data.dataBase64), "base64");
      const ext = (String(data.filename).split(".").pop() || "bin")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 8);
      const safeBase = String(data.filename)
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(0, 60);
      const key = `${new Date().getFullYear()}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}-${safeBase || `file.${ext}`}`;

      const db = admin();
      const { error } = await db.storage
        .from(bucket)
        .upload(key, buf, {
          contentType: String(data.contentType),
          upsert: false,
        });
      if (error) throw new Error(error.message);

      const { data: signed, error: signErr } = await db.storage
        .from(bucket)
        .createSignedUrl(key, 60 * 60 * 24 * 365 * 10);
      if (signErr || !signed)
        throw new Error(signErr?.message || "Failed to sign URL");

      return { ok: true, url: signed.signedUrl, path: key, bucket };
    },
  }),
);
