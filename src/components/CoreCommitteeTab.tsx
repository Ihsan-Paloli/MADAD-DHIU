import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Megaphone, Calendar, Trash2, Plus, Pencil, LayoutDashboard, Archive, ArchiveRestore, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useAnnouncements } from "@/hooks/use-announcements";
import { usePrograms, type Program } from "@/hooks/use-programs";
import { usePortalAuth } from "@/hooks/use-portal-auth";
import {
  createAnnouncementWithToken,
  deleteAnnouncementWithToken,
} from "@/lib/portal-auth.functions";
import { createProgram, updateProgram, deleteProgram, setProgramArchived } from "@/lib/programs.functions";
import {
  ProgramForm,
  emptyProgramValues,
  programToValues,
  type ProgramFormValues,
} from "@/components/ProgramForm";
import { CORE_COMMITTEE } from "@/lib/madad-data";
import { ManageResultButton } from "@/components/ManageResultButton";

type SubTab = "dashboard" | "announcements" | "programs";

export function CoreCommitteeTab() {
  const [sub, setSub] = useState<SubTab>("dashboard");
  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-2xl p-3 flex flex-wrap gap-2">
        <SubBtn active={sub === "dashboard"} onClick={() => setSub("dashboard")} icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</SubBtn>
        <SubBtn active={sub === "announcements"} onClick={() => setSub("announcements")} icon={<Megaphone className="h-4 w-4" />}>Announcements</SubBtn>
        <SubBtn active={sub === "programs"} onClick={() => setSub("programs")} icon={<Calendar className="h-4 w-4" />}>Programs</SubBtn>
      </div>
      {sub === "dashboard" && <CCDashboard onJump={setSub} />}
      {sub === "announcements" && <CCAnnouncements />}
      {sub === "programs" && <CCPrograms />}
    </div>
  );
}

function SubBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition ${active ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "glass border border-border hover:border-primary"}`}
    >
      {icon} {children}
    </button>
  );
}

function CCDashboard({ onJump }: { onJump: (s: SubTab) => void }) {
  const { data: announcements } = useAnnouncements();
  const { data: programs } = usePrograms();

  const ccAnnouncements = useMemo(
    () => announcements.filter((a) => a.wing === CORE_COMMITTEE.slug),
    [announcements],
  );
  const ccPrograms = useMemo(
    () => programs.filter((p) => p.wing === CORE_COMMITTEE.slug),
    [programs],
  );

  const now = Date.now();
  const upcoming = ccPrograms.filter((p) => new Date(p.event_date).getTime() >= now - 86_400_000).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6">
        <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="h-4 w-4" /> Internal unit
        </div>
        <h2 className="font-display text-2xl font-bold mt-1">{CORE_COMMITTEE.name}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage announcements and programs published under the Core Committee. This unit is separate from the 13 official wings.
        </p>
      </motion.div>
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Announcements" value={ccAnnouncements.length} onClick={() => onJump("announcements")} icon={<Megaphone className="h-5 w-5" />} />
        <StatCard label="Programs" value={ccPrograms.length} onClick={() => onJump("programs")} icon={<Calendar className="h-5 w-5" />} />
        <StatCard label="Upcoming" value={upcoming} onClick={() => onJump("programs")} icon={<Sparkles className="h-5 w-5" />} />
      </div>
    </div>
  );
}

function StatCard({ label, value, onClick, icon }: { label: string; value: number; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className="glass-strong rounded-2xl p-5 text-left hover:shadow-elegant transition">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <span className="text-primary">{icon}</span>
      </div>
      <div className="font-display font-bold text-3xl gradient-text mt-2">{value}</div>
    </button>
  );
}

function CCAnnouncements() {
  const qc = useQueryClient();
  const { data } = useAnnouncements();
  const { token } = usePortalAuth("admin");
  const create = createAnnouncementWithToken;
  const remove = deleteAnnouncementWithToken;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const items = useMemo(() => data.filter((a) => a.wing === CORE_COMMITTEE.slug), [data]);

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      await create({ data: { token, title, body, wing: CORE_COMMITTEE.slug } });
      qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Core Committee announcement published");
      setTitle("");
      setBody("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!token || !confirm("Delete this announcement?")) return;
    try {
      await remove({ data: { token, id } });
      qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
      <motion.form onSubmit={publish} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 space-y-4 h-fit">
        <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-widest"><Megaphone className="h-4 w-4" /> New Core Committee announcement</div>
        <h2 className="font-display text-xl font-bold">Broadcast</h2>
        <input required maxLength={200} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
        <textarea required maxLength={4000} placeholder="Message" rows={5} value={body} onChange={(e) => setBody(e.target.value)} className="w-full px-4 py-3 rounded-xl glass border border-border focus:border-primary outline-none" />
        <button disabled={busy} className="w-full h-11 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant disabled:opacity-50">{busy ? "Publishing…" : "Publish"}</button>
      </motion.form>
      <div className="space-y-3">
        {items.length === 0 && <div className="glass rounded-2xl p-6 text-sm text-muted-foreground text-center">No Core Committee announcements yet.</div>}
        {items.map((a) => (
          <div key={a.id} className="glass-strong rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-gold">{CORE_COMMITTEE.name}</div>
                <h3 className="font-display font-semibold">{a.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">{a.body}</p>
                <div className="text-[10px] text-muted-foreground mt-2">{new Date(a.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => onDelete(a.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CCPrograms() {
  const { token } = usePortalAuth("admin");
  const qc = useQueryClient();
  const { data: programs } = usePrograms();
  const create = createProgram;
  const update = updateProgram;
  const remove = deleteProgram;
  const archiveFn = setProgramArchived;
  const [values, setValues] = useState<ProgramFormValues>(emptyProgramValues(CORE_COMMITTEE.slug));
  const [editing, setEditing] = useState<Program | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const items = useMemo(() => programs.filter((p) => p.wing === CORE_COMMITTEE.slug), [programs]);

  async function submit() {
    if (!token) return;
    setBusy(true);
    try {
      const payload = {
        token,
        name: values.name,
        wing: CORE_COMMITTEE.slug, // always lock to core committee
        event_date: values.event_date,
        event_time: values.event_time || null,
        end_time: values.end_time || null,
        venue: values.venue || null,
        description: values.description || null,
        poster_url: values.poster_url,
      };
      if (editing) {
        await update({ data: { ...payload, id: editing.id } });
        toast.success("Program updated");
      } else {
        await create({ data: payload });
        toast.success("Core Committee program created");
      }
      qc.invalidateQueries({ queryKey: ["programs"] });
      setValues(emptyProgramValues(CORE_COMMITTEE.slug));
      setEditing(null);
      setShowForm(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!token) return;
    if (!confirm("Delete this program?")) return;
    try {
      await remove({ data: { token, id } });
      qc.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function onArchive(p: Program) {
    if (!token) return;
    const next = !p.archived_at;
    try {
      await archiveFn({ data: { token, id: p.id, archived: next } });
      qc.invalidateQueries({ queryKey: ["programs"] });
      toast.success(next ? "Program archived" : "Program restored");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">{CORE_COMMITTEE.name} programs ({items.length})</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            setValues(emptyProgramValues(CORE_COMMITTEE.slug));
          }}
          className="h-10 px-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-2 shadow-elegant"
        >
          <Plus className="h-4 w-4" /> {showForm ? "Close" : "New program"}
        </button>
      </div>
      {showForm && token && (
        <ProgramForm
          values={values}
          onChange={setValues}
          token={token}
          wingLocked
          extraWingOptions={[{ slug: CORE_COMMITTEE.slug, name: CORE_COMMITTEE.name }]}
          submitting={busy}
          submitLabel={editing ? "Save changes" : "Create program"}
          onSubmit={submit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
      {items.length === 0 && !showForm && (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">No Core Committee programs yet.</div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p.id} className="glass-strong rounded-2xl p-4 flex flex-col gap-3 h-full">
            <div className="flex gap-3">
              {p.poster_url && <img loading="lazy" decoding="async" src={p.poster_url} alt="" className="h-16 w-16 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase text-gold">{CORE_COMMITTEE.name}</span>
                  {p.archived_at && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">archived</span>}
                  {p.result_status === "published" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">Result published</span>}
                  {p.result_status === "draft" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Result draft</span>}
                </div>
                <h3 className="font-display font-semibold mt-0.5 truncate">{p.name}</h3>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {new Date(p.event_date).toLocaleDateString()} {p.event_time?.slice(0, 5)}
                  {p.venue && ` • ${p.venue}`}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setValues(programToValues(p));
                      setShowForm(true);
                    }}
                    className="h-7 px-2 rounded-lg glass border border-border hover:border-primary text-[11px] inline-flex items-center gap-1"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  {token && <ManageResultButton programId={p.id} programName={p.name} token={token} />}
                  <button onClick={() => onArchive(p)} className="h-7 px-2 rounded-lg glass border border-border hover:border-primary text-[11px] inline-flex items-center gap-1">
                    {p.archived_at ? <><ArchiveRestore className="h-3 w-3" /> Restore</> : <><Archive className="h-3 w-3" /> Archive</>}
                  </button>
                  <button onClick={() => onDelete(p.id)} className="h-7 px-2 rounded-lg glass border border-border hover:border-destructive text-destructive text-[11px] inline-flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
