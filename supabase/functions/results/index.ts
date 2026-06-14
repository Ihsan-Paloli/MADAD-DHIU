import { admin, dispatcher, requireToken, verifyPortalToken, type Portal } from "../_shared/madad.ts";

async function ensureWingAccess(
  auth: { portal: Portal; wing: string | null },
  programId: string,
) {
  if (auth.portal === "admin") return;
  if (auth.portal !== "events") throw new Error("Forbidden");
  const { data } = await admin()
    .from("programs")
    .select("wing, created_by_portal")
    .eq("id", programId)
    .maybeSingle();
  if (!data) throw new Error("Program not found");
  if (data.wing !== auth.wing && data.created_by_portal !== auth.wing)
    throw new Error("Forbidden: you can only manage results for your wing's programs");
}

const resultPayload = (d: any) => ({
  program_id: d.program_id,
  first_place: d.first_place ?? null,
  first_place_photo_url: d.first_place_photo_url ?? null,
  second_place: d.second_place ?? null,
  second_place_photo_url: d.second_place_photo_url ?? null,
  third_place: d.third_place ?? null,
  third_place_photo_url: d.third_place_photo_url ?? null,
  special_mention: d.special_mention ?? null,
  special_mention_photo_url: d.special_mention_photo_url ?? null,
  result_pdf_url: d.result_pdf_url ?? null,
  gallery_image_urls: d.gallery_image_urls ?? [],
  additional_info: d.additional_info ?? null,
  status: d.status ?? "draft",
  published_at: d.status === "published" ? new Date().toISOString() : null,
});

Deno.serve(
  dispatcher({
    async upsertResult(data) {
      const auth = requireToken(data.token, ["admin", "events"]);
      await ensureWingAccess(auth, data.program_id);
      const { data: row, error } = await admin()
        .from("event_results")
        .upsert(resultPayload(data), { onConflict: "program_id" })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { ok: true, result: row };
    },
    async setResultStatus(data) {
      const auth = requireToken(data.token, ["admin", "events"]);
      await ensureWingAccess(auth, data.program_id);
      const { error } = await admin()
        .from("event_results")
        .update({
          status: data.status,
          published_at:
            data.status === "published" ? new Date().toISOString() : null,
        })
        .eq("program_id", data.program_id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async deleteResult(data) {
      const auth = requireToken(data.token, ["admin", "events"]);
      await ensureWingAccess(auth, data.program_id);
      const db = admin();
      const { error } = await db
        .from("event_results")
        .delete()
        .eq("program_id", data.program_id);
      if (error) throw new Error(error.message);
      const { error: pe } = await db
        .from("programs")
        .update({ result_status: "pending", status: "completed" })
        .eq("id", data.program_id)
        .eq("status", "result_published");
      if (pe) throw new Error(pe.message);
      return { ok: true };
    },
    // Public-safe; published rows are returned without a token. Drafts require one.
    async getResultForProgram(data) {
      const db = admin();
      const { data: row } = await db
        .from("event_results")
        .select("*")
        .eq("program_id", data.program_id)
        .maybeSingle();
      if (!row) return { result: null };
      if (row.status !== "published") {
        const auth = data.token
          ? verifyPortalToken(data.token, ["admin", "events"])
          : null;
        if (!auth) return { result: null };
        if (auth.portal !== "admin") {
          try {
            await ensureWingAccess(auth, data.program_id);
          } catch {
            return { result: null };
          }
        }
      }
      return { result: row };
    },
  }),
);
