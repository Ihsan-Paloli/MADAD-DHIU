import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Check, MessageSquare, Star, Mail, RefreshCw } from "lucide-react";
import { listFeedback, markFeedbackReviewed, deleteFeedback } from "@/lib/feedback.functions";

type FeedbackRow = {
  id: string;
  name: string | null;
  email: string;
  rating: number | null;
  message: string;
  status: string;
  reviewed: boolean;
  created_at: string;
};

export function FeedbackTab({ token }: { token: string }) {
  const list = listFeedback;
  const mark = markFeedbackReviewed;
  const remove = deleteFeedback;
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "reviewed">("all");

  async function refresh() {
    setLoading(true);
    try {
      const res = await list({ data: { token } });
      setRows(res.rows as FeedbackRow[]);
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [token]);

  async function onMark(r: FeedbackRow) {
    try { await mark({ data: { token, id: r.id, reviewed: !r.reviewed } }); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  }
  async function onDelete(id: string) {
    if (!confirm("Delete this feedback permanently?")) return;
    try { await remove({ data: { token, id } }); toast.success("Deleted"); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  }

  const filtered = rows.filter((r) =>
    filter === "all" ? true : filter === "new" ? !r.reviewed : r.reviewed
  );
  const unread = rows.filter((r) => !r.reviewed).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold inline-flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Feedback ({rows.length})
          {unread > 0 && <span className="text-[11px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-semibold">{unread} new</span>}
        </h2>
        <div className="flex items-center gap-2">
          {(["all", "new", "reviewed"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`h-8 px-3 rounded-lg text-xs font-semibold capitalize transition ${filter === f ? "bg-gradient-primary text-primary-foreground" : "glass border border-border"}`}>{f}</button>
          ))}
          <button onClick={refresh} className="h-8 w-8 rounded-lg glass border border-border inline-flex items-center justify-center" title="Refresh"><RefreshCw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">No feedback in this view.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className={`glass-strong rounded-2xl p-5 border ${r.reviewed ? "border-border" : "border-gold/40"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-semibold">{r.name || "Anonymous"}</span>
                    <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <Mail className="h-3 w-3" /> {r.email}
                    </a>
                    {r.rating && (
                      <span className="inline-flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating! ? "fill-gold text-gold" : "text-muted-foreground/40"}`} />
                        ))}
                      </span>
                    )}
                    {r.reviewed ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">Reviewed</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold/20 text-gold">New</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{r.message}</p>
                  <div className="mt-2 text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onMark(r)} title={r.reviewed ? "Mark as new" : "Mark reviewed"} className="h-8 px-3 rounded-lg glass border border-border hover:border-primary text-xs inline-flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> {r.reviewed ? "Unmark" : "Reviewed"}
                  </button>
                  <button onClick={() => onDelete(r.id)} className="h-8 px-3 rounded-lg glass border border-border hover:border-destructive text-destructive text-xs inline-flex items-center gap-1">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
