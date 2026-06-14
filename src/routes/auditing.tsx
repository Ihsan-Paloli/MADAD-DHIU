import { useDocumentMeta } from "@/lib/use-document-meta";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/PageShell";
import { PortalGate } from "@/components/PortalGate";
import { usePortalAuth } from "@/hooks/use-portal-auth";
import { useReports, type AuditReport } from "@/hooks/use-stationery";
import { usePrograms } from "@/hooks/use-programs";
import { createReport, updateReport, deleteReport, upsertWingStats } from "@/lib/auditing.functions";
import { FileUploadField } from "@/components/ProgramForm";
import { WINGS } from "@/lib/madad-data";
import { BarChart3, LogOut, Plus, Pencil, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";


function Auditing() {
  useDocumentMeta({ title: 'Auditing Portal — MADAD' });

  return (
    <PageShell>
      <PageHeader eyebrow="Auditing Portal" title="Analytics & Reports" description="Auditing Wing — upload reports and update wing statistics. Changes flow to the Public Analytics page." />
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-6">
          <PortalGate portal="auditing" eyebrow="Auditing Access" title="Auditing Portal" description="Restricted to the Auditing Wing.">
            {(signOut) => <AuditingDashboard signOut={signOut} />}
          </PortalGate>
        </div>
      </section>
    </PageShell>
  );
}

function AuditingDashboard({ signOut }: { signOut: () => void }) {
  const { token } = usePortalAuth("auditing");
  const qc = useQueryClient();
  const { data: reports } = useReports();
  const { data: programs } = usePrograms();
  const create = createReport;
  const update = updateReport;
  const remove = deleteReport;
  const upsert = upsertWingStats;

  const [editing, setEditing] = useState<AuditReport | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      const payload = { token, title, body: body || null, file_url: fileUrl };
      if (editing) {
        await update({ data: { ...payload, id: editing.id } });
        toast.success("Report updated");
      } else {
        await create({ data: payload });
        toast.success("Report uploaded");
      }
      qc.invalidateQueries({ queryKey: ["audit_reports"] });
      setTitle(""); setBody(""); setFileUrl(null); setEditing(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  }

  async function onDelete(id: string) {
    if (!token || !confirm("Delete?")) return;
    try {
      await remove({ data: { token, id } });
      qc.invalidateQueries({ queryKey: ["audit_reports"] });
      toast.success("Deleted");
    }
    catch (err) { toast.error((err as Error).message); }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={signOut} className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1.5">
          <LogOut className="h-3 w-3" /> Sign out
        </button>
      </div>

      <div className="glass-strong rounded-3xl p-6">
        <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-widest"><BarChart3 className="h-4 w-4" /> Activity overview</div>
        <h2 className="font-display text-xl font-bold mt-1">Live numbers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <Stat label="Total programs" value={programs.length} />
          <Stat label="Upcoming" value={programs.filter(p => new Date(p.event_date) >= new Date()).length} />
          <Stat label="Completed" value={programs.filter(p => new Date(p.event_date) < new Date()).length} />
          <Stat label="Reports" value={reports.length} />
        </div>
      </div>

      <form onSubmit={submit} className="glass-strong rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-widest"><FileText className="h-4 w-4" /> {editing ? "Edit report" : "Upload report"}</div>
        <input required maxLength={200} placeholder="Report title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
        <textarea rows={3} maxLength={8000} placeholder="Summary / notes" value={body} onChange={(e) => setBody(e.target.value)} className="w-full px-4 py-3 rounded-xl glass border border-border focus:border-primary outline-none" />
        {token && <FileUploadField label="Report file (image or PDF)" bucket="reports" token={token} value={fileUrl} onChange={setFileUrl} accept="image/*,application/pdf" />}
        <div className="flex gap-2">
          <button disabled={busy} className="h-11 px-6 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant disabled:opacity-50"><Plus className="inline h-4 w-4 mr-1" /> {editing ? "Save changes" : "Add report"}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setTitle(""); setBody(""); setFileUrl(null); }} className="h-11 px-4 rounded-xl glass border border-border text-sm">Cancel</button>}
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="font-display text-lg font-semibold">Reports ({reports.length})</h3>
        {reports.length === 0 && <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">No reports yet.</div>}
        {reports.map((r) => (
          <div key={r.id} className="glass-strong rounded-2xl p-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="font-display font-semibold">{r.title}</h4>
              {r.body && <p className="text-sm text-muted-foreground mt-1">{r.body}</p>}
              {r.file_url && <a href={r.file_url} target="_blank" rel="noopener" className="text-xs text-primary mt-2 inline-block">View file →</a>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setEditing(r); setTitle(r.title); setBody(r.body || ""); setFileUrl(r.file_url); }} className="h-8 px-3 rounded-lg glass border border-border hover:border-primary text-xs inline-flex items-center gap-1"><Pencil className="h-3 w-3" /> Edit</button>
              <button onClick={() => onDelete(r.id)} className="h-8 px-3 rounded-lg glass border border-border hover:border-destructive text-destructive text-xs inline-flex items-center gap-1"><Trash2 className="h-3 w-3" /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      <WingStatsEditor token={token} upsert={upsert} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <div className="font-display font-bold text-3xl gradient-text">{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function WingStatsEditor({ token, upsert }: { token: string | null; upsert: ReturnType<typeof useServerFn<typeof upsertWingStats>> }) {
  const [wing, setWing] = useState<string>(WINGS[0].slug);
  const [progs, setProgs] = useState("");
  const [members, setMembers] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      await upsert({ data: {
        token, wing,
        total_programs: progs ? parseInt(progs, 10) : null,
        active_members: members ? parseInt(members, 10) : null,
        notes: notes || null,
      }});
      toast.success("Wing stats updated");
      setProgs(""); setMembers(""); setNotes("");
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={save} className="glass-strong rounded-3xl p-6 space-y-4">
      <h3 className="font-display text-lg font-semibold">Override wing statistics</h3>
      <p className="text-xs text-muted-foreground">Used on the Public Analytics page. Leave blank to fall back to live program counts.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <select value={wing} onChange={(e) => setWing(e.target.value)} className="h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none">
          {WINGS.map(w => <option key={w.slug} value={w.slug}>{w.name}</option>)}
        </select>
        <input type="number" min="0" placeholder="Total programs" value={progs} onChange={(e) => setProgs(e.target.value)} className="h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
        <input type="number" min="0" placeholder="Active members" value={members} onChange={(e) => setMembers(e.target.value)} className="h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
        <input maxLength={1000} placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
      </div>
      <button disabled={busy} className="h-11 px-6 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
    </form>
  );
}

export default Auditing;
