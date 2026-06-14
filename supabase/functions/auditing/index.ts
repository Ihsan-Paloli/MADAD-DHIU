import { admin, dispatcher, requireToken } from "../_shared/madad.ts";

const reportFields = (d: any) => ({
  title: String(d.title || "").trim(),
  body: d.body || null,
  file_url: d.file_url || null,
});

Deno.serve(
  dispatcher({
    async createReport(data) {
      requireToken(data.token, ["admin", "auditing"]);
      const { error } = await admin().from("audit_reports").insert(reportFields(data));
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async updateReport(data) {
      requireToken(data.token, ["admin", "auditing"]);
      const { error } = await admin()
        .from("audit_reports")
        .update(reportFields(data))
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async deleteReport(data) {
      requireToken(data.token, ["admin", "auditing"]);
      const { error } = await admin().from("audit_reports").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async upsertWingStats(data) {
      requireToken(data.token, ["admin", "auditing"]);
      const { error } = await admin().from("wing_stats_overrides").upsert({
        wing: String(data.wing).trim(),
        total_programs: data.total_programs ?? null,
        active_members: data.active_members ?? null,
        notes: data.notes || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
      return { ok: true };
    },
  }),
);
