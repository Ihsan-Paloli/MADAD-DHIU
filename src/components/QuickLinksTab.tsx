import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink, Link as LinkIcon, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { createQuickLink, updateQuickLink, deleteQuickLink, toggleQuickLink, listAllQuickLinks } from "@/lib/quick-links.functions";
import { FileUploadField } from "@/components/ProgramForm";
import type { QuickLink } from "@/hooks/use-quick-links";

const CATS: QuickLink["category"][] = ["events","academic","institutional","partner","media","other"];

export function QuickLinksTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const list = listAllQuickLinks;
  const create = createQuickLink;
  const update = updateQuickLink;
  const remove = deleteQuickLink;
  const toggle = toggleQuickLink;

  const [rows, setRows] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<QuickLink | null>(null);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [v, setV] = useState({
    title: "", description: "", url: "", category: "other" as QuickLink["category"],
    icon_url: null as string | null, display_order: 0, enabled: true,
  });
  function reset() {
    setEditing(null);
    setV({ title: "", description: "", url: "", category: "other", icon_url: null, display_order: 0, enabled: true });
  }
  async function refresh() {
    setLoading(true);
    try {
      const res = await list({ data: { token } });
      setRows(res.rows as QuickLink[]);
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [token]);

  function startEdit(r: QuickLink) {
    setEditing(r);
    setV({
      title: r.title, description: r.description || "", url: r.url, category: r.category,
      icon_url: r.icon_url, display_order: r.display_order, enabled: r.enabled,
    });
    setShow(true);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      const payload = { token, ...v, description: v.description || null };
      if (editing) await update({ data: { ...payload, id: editing.id } });
      else await create({ data: payload });
      toast.success(editing ? "Link updated" : "Link added");
      qc.invalidateQueries({ queryKey: ["quick_links"] });
      reset(); setShow(false); refresh();
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }
  async function onDelete(id: string) {
    if (!confirm("Delete this link?")) return;
    try { await remove({ data: { token, id } }); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["quick_links"] }); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  }
  async function onToggle(r: QuickLink) {
    try { await toggle({ data: { token, id: r.id, enabled: !r.enabled } }); qc.invalidateQueries({ queryKey: ["quick_links"] }); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  }
  async function reorder(r: QuickLink, dir: -1 | 1) {
    const newOrder = Math.max(0, r.display_order + dir);
    try {
      await update({ data: { token, id: r.id, title: r.title, description: r.description, url: r.url, category: r.category, icon_url: r.icon_url, display_order: newOrder, enabled: r.enabled } });
      qc.invalidateQueries({ queryKey: ["quick_links"] }); refresh();
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold inline-flex items-center gap-2"><LinkIcon className="h-5 w-5" /> Quick Links ({rows.length})</h2>
        <button onClick={() => { if (show) reset(); setShow(!show); }} className="h-10 px-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-2 shadow-elegant">
          <Plus className="h-4 w-4" /> {show ? "Close" : "New link"}
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
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">URL</label>
              <input required type="url" maxLength={2048} value={v.url} onChange={(e) => setV({ ...v, url: e.target.value })} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Description</label>
              <textarea rows={2} maxLength={1000} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl glass border border-border focus:border-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category</label>
              <select value={v.category} onChange={(e) => setV({ ...v, category: e.target.value as QuickLink["category"] })} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border outline-none">
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Display order</label>
              <input type="number" min={0} value={v.display_order} onChange={(e) => setV({ ...v, display_order: Number(e.target.value) })} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
            </div>
            <div className="sm:col-span-2">
              <FileUploadField label="Icon / image (optional)" bucket="gallery" token={token} value={v.icon_url} onChange={(u) => setV({ ...v, icon_url: u })} />
            </div>
            <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={v.enabled} onChange={(e) => setV({ ...v, enabled: e.target.checked })} /> Enabled (visible publicly)
            </label>
          </div>
          <div className="flex gap-2">
            <button disabled={busy} className="h-11 px-6 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant disabled:opacity-50">{editing ? "Save" : "Add link"}</button>
            <button type="button" onClick={() => { reset(); setShow(false); }} className="h-11 px-4 rounded-xl glass border border-border text-sm">Cancel</button>
          </div>
        </form>
      )}
      {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="space-y-2">
          {rows.length === 0 && <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">No quick links yet.</div>}
          {rows.map((r) => (
            <div key={r.id} className="glass-strong rounded-2xl p-4 flex flex-wrap items-center gap-3">
              {r.icon_url && <img loading="lazy" decoding="async" src={r.icon_url} alt="" className="h-10 w-10 rounded-lg object-cover glass" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-widest text-gold">{r.category}</span>
                  {!r.enabled && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">disabled</span>}
                </div>
                <div className="font-display font-semibold truncate">{r.title}</div>
                <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-primary inline-flex items-center gap-1 truncate"><ExternalLink className="h-3 w-3" />{r.url}</a>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => reorder(r, -1)} title="Move up" className="h-8 w-8 rounded-lg glass border border-border hover:border-primary inline-flex items-center justify-center"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => reorder(r, 1)} title="Move down" className="h-8 w-8 rounded-lg glass border border-border hover:border-primary inline-flex items-center justify-center"><ArrowDown className="h-3.5 w-3.5" /></button>
                <button onClick={() => onToggle(r)} title={r.enabled ? "Disable" : "Enable"} className="h-8 w-8 rounded-lg glass border border-border hover:border-primary inline-flex items-center justify-center">{r.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
                <button onClick={() => startEdit(r)} className="h-8 px-3 rounded-lg glass border border-border hover:border-primary text-xs inline-flex items-center gap-1"><Pencil className="h-3 w-3" /> Edit</button>
                <button onClick={() => onDelete(r.id)} className="h-8 px-3 rounded-lg glass border border-border hover:border-destructive text-destructive text-xs inline-flex items-center gap-1"><Trash2 className="h-3 w-3" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
