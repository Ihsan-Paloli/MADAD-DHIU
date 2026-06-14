// Achievements admin operations.
import { admin, dispatcher, requireToken } from "../_shared/madad.ts";

const adminFields = (d: any) => ({
  title: String(d.title || "").trim(),
  description: d.description || null,
  category: String(d.category || "").trim(),
  achievement_year: Number(d.achievement_year),
  achievement_date: d.achievement_date || null,
  photo_url: d.photo_url || null,
  certificate_url: d.certificate_url || null,
  level: d.level || null,
  related_program_id: d.related_program_id || null,
  archived: !!d.archived,
});

Deno.serve(
  dispatcher({
    async createAchievement(data) {
      requireToken(data.token, ["admin"]);
      const { error } = await admin().from("achievements").insert(adminFields(data));
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async updateAchievement(data) {
      requireToken(data.token, ["admin"]);
      const { error } = await admin()
        .from("achievements")
        .update(adminFields(data))
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async deleteAchievement(data) {
      requireToken(data.token, ["admin"]);
      const { error } = await admin().from("achievements").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async setAchievementArchived(data) {
      requireToken(data.token, ["admin"]);
      const { error } = await admin()
        .from("achievements")
        .update({ archived: !!data.archived })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async listAllAchievements(data) {
      requireToken(data.token, ["admin"]);
      const { data: rows, error } = await admin()
        .from("achievements")
        .select("*")
        .order("achievement_year", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return { rows: rows ?? [] };
    },
  }),
);
