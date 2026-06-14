import { admin, dispatcher, requireToken } from "../_shared/madad.ts";

const fields = (d: any) => ({
  title: String(d.title || "").trim(),
  description: d.description || null,
  url: String(d.url || "").trim(),
  category: d.category,
  icon_url: d.icon_url || null,
  display_order: d.display_order ?? 0,
  enabled: d.enabled ?? true,
});

Deno.serve(
  dispatcher({
    async createQuickLink(data) {
      requireToken(data.token, ["admin"]);
      const { error } = await admin().from("quick_links").insert(fields(data));
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async updateQuickLink(data) {
      requireToken(data.token, ["admin"]);
      const { error } = await admin()
        .from("quick_links")
        .update(fields(data))
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async deleteQuickLink(data) {
      requireToken(data.token, ["admin"]);
      const { error } = await admin().from("quick_links").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async toggleQuickLink(data) {
      requireToken(data.token, ["admin"]);
      const { error } = await admin()
        .from("quick_links")
        .update({ enabled: !!data.enabled })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async listAllQuickLinks(data) {
      requireToken(data.token, ["admin"]);
      const { data: rows, error } = await admin()
        .from("quick_links")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return { rows: rows ?? [] };
    },
  }),
);
