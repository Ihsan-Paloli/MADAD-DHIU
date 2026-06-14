import { admin, dispatcher, requireToken } from "../_shared/madad.ts";

const fields = (d: any) => ({
  name: String(d.name || "").trim(),
  event_date: String(d.event_date),
  event_time: d.event_time || null,
  end_time: d.end_time || null,
  venue: d.venue || null,
  description: d.description || null,
  poster_url: d.poster_url || null,
});

Deno.serve(
  dispatcher({
    async createProgram(data) {
      const auth = requireToken(data.token, ["admin", "events", "auditing"]);
      const wing = auth.portal === "admin" ? data.wing : auth.wing || data.wing;
      const createdBy = auth.portal === "admin" ? "admin" : auth.wing || "events";
      const { data: row, error } = await admin()
        .from("programs")
        .insert({ ...fields(data), wing, created_by_portal: createdBy })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { ok: true, program: row };
    },
    async updateProgram(data) {
      const auth = requireToken(data.token, ["admin", "events", "auditing"]);
      const db = admin();
      if (auth.portal !== "admin") {
        const { data: existing } = await db
          .from("programs")
          .select("created_by_portal,wing")
          .eq("id", data.id)
          .maybeSingle();
        if (
          !existing ||
          (existing.created_by_portal !== auth.wing && existing.wing !== auth.wing)
        )
          throw new Error("Forbidden: you can only edit your wing's programs");
      }
      const payload: any = { ...fields(data) };
      if (auth.portal === "admin") payload.wing = data.wing;
      const { error } = await db.from("programs").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async deleteProgram(data) {
      const auth = requireToken(data.token, ["admin", "events", "auditing"]);
      const db = admin();
      if (auth.portal !== "admin") {
        if (auth.portal !== "events" || !auth.wing)
          throw new Error("Not allowed to delete this program");
        const { data: row, error: rowErr } = await db
          .from("programs")
          .select("wing, created_by_portal")
          .eq("id", data.id)
          .maybeSingle();
        if (rowErr) throw new Error(rowErr.message);
        if (
          !row ||
          (row.wing !== auth.wing && row.created_by_portal !== auth.wing)
        )
          throw new Error("You can only delete programs from your own wing");
      }
      const { error } = await db.from("programs").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async setProgramArchived(data) {
      requireToken(data.token, ["admin"]);
      const payload = data.archived
        ? { archived_at: new Date().toISOString(), status: "archived" as const }
        : { archived_at: null, status: "completed" as const };
      const { error } = await admin().from("programs").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
  }),
);
