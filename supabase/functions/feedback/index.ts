import { admin, dispatcher, requireToken } from "../_shared/madad.ts";

Deno.serve(
  dispatcher({
    // Publicly callable — no token (rate limited at the platform layer).
    async submitFeedback(data) {
      const email = String(data.email || "").trim();
      const message = String(data.message || "").trim();
      if (!email || !message) throw new Error("Email and message required");
      const { error } = await admin().from("feedback").insert({
        name: data.name || null,
        email,
        rating: data.rating ?? null,
        message,
      });
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async listFeedback(data) {
      requireToken(data.token, ["admin"]);
      const { data: rows, error } = await admin()
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return { rows: rows ?? [] };
    },
    async markFeedbackReviewed(data) {
      requireToken(data.token, ["admin"]);
      const { error } = await admin()
        .from("feedback")
        .update({
          reviewed: !!data.reviewed,
          status: data.reviewed ? "resolved" : "open",
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    async deleteFeedback(data) {
      requireToken(data.token, ["admin"]);
      const { error } = await admin().from("feedback").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    },
  }),
);
