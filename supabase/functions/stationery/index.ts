import { admin, dispatcher, requireToken } from "../_shared/madad.ts";

const fields = (d: any) => ({
  name: String(d.name || "").trim(),
  price: Number(d.price),
  quantity: Number(d.quantity),
  description: d.description || null,
  image_url: d.image_url || null,
});

Deno.serve(
  dispatcher({
    async createStationery(data) {
      requireToken(data.token, ["admin"]);
      const { error } = await admin().from("stationery_items").insert(fields(data));
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async updateStationery(data) {
      requireToken(data.token, ["admin"]);
      const { error } = await admin()
        .from("stationery_items")
        .update(fields(data))
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async deleteStationery(data) {
      requireToken(data.token, ["admin"]);
      const { error } = await admin()
        .from("stationery_items")
        .delete()
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
  }),
);
