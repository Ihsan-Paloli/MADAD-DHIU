import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Archive, ArchiveRestore, Trophy } from "lucide-react";
import { createAchievement, updateAchievement, deleteAchievement, setAchievementArchived, listAllAchievements } from "@/lib/achievements.functions";
import { FileUploadField } from "@/components/ProgramForm";
import { usePrograms } from "@/hooks/use-programs";
import type { Achievement } from "@/hooks/use-achievements";

const CATS = ["Arts","Sports","Academic","Debate","Quiz","Community Service","Leadership","Special Recognition"];
const LEVELS: Achievement["level"][] = ["institution","district","state","national","international","special"];

export function AchievementsTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const list = listAllAchievements;
  const create = createAchievement;
  const update = updateAchievement;
  const remove = deleteAchievement;
  const archiveFn = setAchievementArchived;
  const { data: programs } = usePrograms();

  const [rows, setRows] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const initial = () => ({
    title: "", description: "", category: "Arts",
    achievement_year: new Date().getFullYear(),
    achievement_date: "" as string | "",
    photo_url: null as string | null,
    certificate_url: null as string | null,
    level: "institution" as Achievement["level"],
    related_program_id: "" as string | "",
    archived: false,
  });
  const [v, setV] = useState(initial());

  async function refresh() {
    setLoading(true);
    try { const r = await list({ data: { token } }); setRows(r.rows as Achievement[]); }
    catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [token]);

  function startEdit(r: Achievement) {
    setEditing(r);
    setV({
      title: r.title, description: r.description || "", category: r.category,
      achievement_year: r.achievement_year, achievement_date: r.achievement_date || "",
      photo_url: r.photo_url, certificate_url: r.certificate_url, level: r.level,
      related_program_id: r.related_program_id || "", archived: r.archived,
    });
    setShow(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      const payload = {
        token, title: v.title, description: v.description || null, category: v.category,
        achievement_year: Number(v.achievement_year), achievement_date: v.achievement_date || null,
        photo_url: v.photo_url, certificate_url: v.certificate_url, level: v.level || null,
        related_program_id: v.related_program_id || null, archived: v.archived,
      };
      if (editing) await update({ data: { ...payload, id: editing.id } });
      else await create({ data: payload });
      toast.success(editing ? "Achievement updated" : "Achievement added");
      qc.invalidateQueries({ queryKey: ["achievements"] });
      setEditing(null); setV(initial()); setShow(false); refresh();
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this achievement?")) return;
    try { await remove({ data: { token, id } }); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["achievements"] }); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  }
  async function onArchive(r: Achievement) {
    try { await archiveFn({ data: { token, id: r.id, archived: !r.archived } }); qc.invalidateQueries({ queryKey: ["achievements"] }); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold inline-flex items-center gap-2"><Trophy className="h-5 w-5" /> Achievement Hall ({rows.length})</h2>
        <button onClick={() => { if (show) { setEditing(null); setV(initial()); } setShow(!show); }} className="h-10 px-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-2 shadow-elegant">
          <Plus className="h-4 w-4" /> {show ? "Close" : "New achievement"}
        </button>
      </div>
      {show && (
        <form onSubmit={submit} className="glass-strong rounded-3xl p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Title</label>
              <input required maxLength={200} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Description</label>
              <textarea rows={3} maxLength={4000} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl glass border border-border focus:border-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category</label>
              <select value={v.category} onChange={(e) => setV({ ...v, category: e.target.value })} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border outline-none">
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Level</label>
              <select value={v.level ?? ""} onChange={(e) => setV({ ...v, level: e.target.value as Achievement["level"] })} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border outline-none">
                {LEVELS.map((l) => <option key={l} value={l ?? ""}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Year</label>
              <input type="number" min={1900} max={3000} required value={v.achievement_year} onChange={(e) => setV({ ...v, achievement_year: Number(e.target.value) })} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Date (optional)</label>
              <input type="date" value={v.achievement_date} onChange={(e) => setV({ ...v, achievement_date: e.target.value })} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Related program (optional)</label>
              <select value={v.related_program_id} onChange={(e) => setV({ ...v, related_program_id: e.target.value })} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border outline-none">
                <option value="">None</option>
                {programs.map((p) => <option key={p.id} value={p.id}>{p.name} — {new Date(p.event_date).getFullYear()}</option>)}
              </select>
            </div>
            <div>
              <FileUploadField label="Photo (optional)" bucket="gallery" token={token} value={v.photo_url} onChange={(u) => setV({ ...v, photo_url: u })} />
            </div>
            <div>
              <FileUploadField label="Certificate / PDF (optional)" bucket="results" token={token} value={v.certificate_url} onChange={(u) => setV({ ...v, certificate_url: u })} accept=".pdf,image/*" />
            </div>
          </div>
          <div className="flex gap-2">
            <button disabled={busy} className="h-11 px-6 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant disabled:opacity-50">{editing ? "Save" : "Add"}</button>
            <button type="button" onClick={() => { setEditing(null); setV(initial()); setShow(false); }} className="h-11 px-4 rounded-xl glass border border-border text-sm">Cancel</button>
          </div>
        </form>
      )}
      {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="grid sm:grid-cols-2 gap-3">
          {rows.length === 0 && <div className="sm:col-span-2 glass rounded-2xl p-6 text-center text-sm text-muted-foreground">No achievements yet.</div>}
          {rows.map((r) => (
            <div key={r.id} className={`glass-strong rounded-2xl p-4 flex gap-3 ${r.archived ? "opacity-60" : ""}`}>
              {r.photo_url && <img loading="lazy" decoding="async" src={r.photo_url} alt="" className="h-20 w-20 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase text-gold">{r.category}</span>
                  {r.level && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{r.level}</span>}
                  {r.archived && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">archived</span>}
                </div>
                <h4 className="font-display font-semibold mt-0.5 truncate">{r.title}</h4>
                <div className="text-xs text-muted-foreground">{r.achievement_year}{r.achievement_date ? ` · ${new Date(r.achievement_date).toLocaleDateString()}` : ""}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <button onClick={() => startEdit(r)} className="h-7 px-2 rounded-lg glass border border-border text-[11px] inline-flex items-center gap-1"><Pencil className="h-3 w-3" /> Edit</button>
                  <button onClick={() => onArchive(r)} className="h-7 px-2 rounded-lg glass border border-border text-[11px] inline-flex items-center gap-1">{r.archived ? <ArchiveRestore className="h-3 w-3" /> : <Archive className="h-3 w-3" />} {r.archived ? "Restore" : "Archive"}</button>
                  <button onClick={() => onDelete(r.id)} className="h-7 px-2 rounded-lg glass border border-border hover:border-destructive text-destructive text-[11px] inline-flex items-center gap-1"><Trash2 className="h-3 w-3" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
