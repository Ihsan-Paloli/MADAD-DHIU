import { admin, dispatcher, requireToken } from "../_shared/madad.ts";

Deno.serve(
  dispatcher({
    async createGalleryPhoto(data) {
      requireToken(data.token, ["admin"]);
      const { data: row, error } = await admin()
        .from("gallery_photos")
        .insert({
          image_url: String(data.image_url),
          caption: data.caption || null,
          category: data.category || null,
          wing: data.wing || null,
          event_year: data.event_year ?? new Date().getFullYear(),
          program_id: data.program_id || null,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { ok: true, photo: row };
    },
    async deleteGalleryPhoto(data) {
      requireToken(data.token, ["admin"]);
      const { error } = await admin()
        .from("gallery_photos")
        .delete()
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
  }),
);
