import { useDocumentMeta } from "@/lib/use-document-meta";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PageShell, PageHeader } from "@/components/PageShell";
import { PortalGate } from "@/components/PortalGate";
import { useAnnouncements } from "@/hooks/use-announcements";
import { usePrograms, type Program } from "@/hooks/use-programs";
import { useStationery, type StationeryItem } from "@/hooks/use-stationery";
import { usePortalAuth } from "@/hooks/use-portal-auth";
import {
  createAnnouncementWithToken,
  deleteAnnouncementWithToken,
} from "@/lib/portal-auth.functions";
import { createProgram, updateProgram, deleteProgram } from "@/lib/programs.functions";
import { createStationery, updateStationery, deleteStationery } from "@/lib/stationery.functions";
import { setProgramArchived } from "@/lib/programs.functions";
import { ProgramForm, emptyProgramValues, programToValues, type ProgramFormValues, FileUploadField } from "@/components/ProgramForm";
import { WINGS } from "@/lib/madad-data";
import { Megaphone, Trash2, LogOut, Calendar, Package, Plus, Pencil, Image as ImageIcon, Link as LinkIcon, Trophy, Archive, ArchiveRestore, MessageSquare, ShieldCheck, Settings, Eye, EyeOff, KeyRound } from "lucide-react";
import { ManageResultButton } from "@/components/ManageResultButton";
import { GalleryTab } from "@/components/GalleryTab";
import { QuickLinksTab } from "@/components/QuickLinksTab";
import { AchievementsTab } from "@/components/AchievementsTab";
import { FeedbackTab } from "@/components/FeedbackTab";
import { FoldedPrograms } from "@/components/FoldedPrograms";
import { CoreCommitteeTab } from "@/components/CoreCommitteeTab";
import { setPortalPassword } from "@/lib/portal-auth.functions";
import { toast } from "sonner";


function Admin() {
  useDocumentMeta({ title: 'Admin — MADAD' });

  return (
    <PageShell>
      <PageHeader eyebrow="Admin" title="Management Console" description="Programs, announcements, stationery — everything reflects across the site instantly." />
      <section className="py-10">
        <div className="mx-auto max-w-6xl px-6">
          <PortalGate
            portal="admin"
            eyebrow="Admin Access"
            title="Admin Portal"
            description="Full access — manage programs, announcements, and stationery."
          >
            {(signOut) => <AdminDashboard signOut={signOut} />}
          </PortalGate>
        </div>
      </section>
    </PageShell>
  );
}

type Tab = "programs" | "announcements" | "stationery" | "gallery" | "quick_links" | "achievements" | "feedback" | "core_committee" | "settings";

function AdminDashboard({ signOut }: { signOut: () => void }) {
  const [tab, setTab] = useState<Tab>("programs");
  const { token } = usePortalAuth("admin");
  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <TabBtn active={tab === "programs"} onClick={() => setTab("programs")} icon={<Calendar className="h-4 w-4" />}>Programs</TabBtn>
          <TabBtn active={tab === "announcements"} onClick={() => setTab("announcements")} icon={<Megaphone className="h-4 w-4" />}>Announcements</TabBtn>
          <TabBtn active={tab === "core_committee"} onClick={() => setTab("core_committee")} icon={<ShieldCheck className="h-4 w-4" />}>Core Committee</TabBtn>
          <TabBtn active={tab === "gallery"} onClick={() => setTab("gallery")} icon={<ImageIcon className="h-4 w-4" />}>Gallery</TabBtn>
          <TabBtn active={tab === "achievements"} onClick={() => setTab("achievements")} icon={<Trophy className="h-4 w-4" />}>Achievements</TabBtn>
          <TabBtn active={tab === "quick_links"} onClick={() => setTab("quick_links")} icon={<LinkIcon className="h-4 w-4" />}>Quick Links</TabBtn>
          <TabBtn active={tab === "stationery"} onClick={() => setTab("stationery")} icon={<Package className="h-4 w-4" />}>Stationery</TabBtn>
          <TabBtn active={tab === "feedback"} onClick={() => setTab("feedback")} icon={<MessageSquare className="h-4 w-4" />}>Feedback</TabBtn>
          <TabBtn active={tab === "settings"} onClick={() => setTab("settings")} icon={<Settings className="h-4 w-4" />}>Settings</TabBtn>
        </div>
        <button onClick={signOut} className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1.5">
          <LogOut className="h-3 w-3" /> Sign out
        </button>
      </div>
      {tab === "programs" && <ProgramsTab />}
      {tab === "announcements" && <AnnouncementsTab />}
      {tab === "core_committee" && <CoreCommitteeTab />}
      {tab === "gallery" && token && <GalleryTab token={token} />}
      {tab === "achievements" && token && <AchievementsTab token={token} />}
      {tab === "quick_links" && token && <QuickLinksTab token={token} />}
      {tab === "stationery" && <StationeryTab />}
      {tab === "feedback" && token && <FeedbackTab token={token} />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <PortalPasswordCard portal="events" label="Events Portal Password" />
      <PortalPasswordCard portal="auditing" label="Auditing Portal Password" />
    </div>
  );
}

function PortalPasswordCard({ portal, label }: { portal: "events" | "auditing"; label: string }) {
  const setPwd = setPortalPassword;
  const [pwd, setPwd1] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (pwd !== confirm) { toast.error("Passwords don't match"); return; }
    setBusy(true);
    try {
      await setPwd({ data: { portal, newPassword: pwd } });
      toast.success(`${label} updated`);
      setPwd1(""); setConfirm("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="glass-strong rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-widest">
        <KeyRound className="h-4 w-4" /> {label}
      </div>
      <p className="text-xs text-muted-foreground">Changes take effect immediately. Passwords are stored as scrypt hashes — never in plain text.</p>
      <div className="space-y-3">
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={pwd}
            onChange={(e) => setPwd1(e.target.value)}
            placeholder="New password (min 6 chars)"
            className="w-full h-11 px-4 pr-11 rounded-xl glass border border-border focus:border-primary outline-none text-sm"
            autoComplete="new-password"
          />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide" : "Show"}
            className="absolute inset-y-0 right-0 px-3 text-muted-foreground hover:text-primary">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className="w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none text-sm"
            autoComplete="new-password"
          />
        </div>
      </div>
      <button disabled={busy} className="h-11 px-5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-2 shadow-elegant hover:shadow-gold transition disabled:opacity-50">
        {busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-10 px-4 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition ${active ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "glass border border-border hover:border-primary"}`}
    >
      {icon} {children}
    </button>
  );
}

function ProgramsTab() {
  const { token } = usePortalAuth("admin");
  const qc = useQueryClient();
  const { data: programs } = usePrograms();
  const create = createProgram;
  const update = updateProgram;
  const remove = deleteProgram;
  const archiveFn = setProgramArchived;
  const [values, setValues] = useState<ProgramFormValues>(emptyProgramValues());
  const [editing, setEditing] = useState<Program | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!token) return;
    setBusy(true);
    try {
      const payload = {
        token,
        name: values.name,
        wing: values.wing,
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
        toast.success("Program created");
      }
      qc.invalidateQueries({ queryKey: ["programs"] });
      setValues(emptyProgramValues());
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
    if (!confirm("Delete this program? It will be removed everywhere on the site.")) return;
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
    } catch (err) { toast.error((err as Error).message); }
  }

  const renderCard = (p: Program) => (
    <div className="glass-strong rounded-2xl p-4 flex flex-col gap-3 h-full">
      <div className="flex gap-3">
        {p.poster_url && <img loading="lazy" decoding="async" src={p.poster_url} alt="" className="h-16 w-16 rounded-lg object-cover" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase text-gold">{WINGS.find(w => w.slug === p.wing)?.name ?? p.wing}</span>
            {p.archived_at && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">archived</span>}
            {p.result_status === "published" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">Result published</span>}
            {p.result_status === "draft" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Result draft</span>}
          </div>
          <h3 className="font-display font-semibold mt-0.5 truncate">{p.name}</h3>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {new Date(p.event_date).toLocaleDateString()} {p.event_time?.slice(0,5)}
            {p.venue && ` • ${p.venue}`}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button onClick={() => { setEditing(p); setValues(programToValues(p)); setShowForm(true); }} className="h-7 px-2 rounded-lg glass border border-border hover:border-primary text-[11px] inline-flex items-center gap-1">
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
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Programs ({programs.length})</h2>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setValues(emptyProgramValues()); }} className="h-10 px-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-2 shadow-elegant">
          <Plus className="h-4 w-4" /> {showForm ? "Close" : "New program"}
        </button>
      </div>
      {showForm && token && (
        <ProgramForm
          values={values}
          onChange={setValues}
          token={token}
          submitting={busy}
          submitLabel={editing ? "Save changes" : "Create program"}
          onSubmit={submit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
      <FoldedPrograms programs={programs} renderCard={renderCard} />
    </div>
  );
}


function AnnouncementsTab() {
  const qc = useQueryClient();
  const { data } = useAnnouncements();
  const { token } = usePortalAuth("admin");
  const create = createAnnouncementWithToken;
  const remove = deleteAnnouncementWithToken;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [wing, setWing] = useState("");
  const [busy, setBusy] = useState(false);

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      await create({ data: { token, title, body, wing: wing || null } });
      qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement published");
      setTitle(""); setBody(""); setWing("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  }
  async function onDelete(id: string) {
    if (!token || !confirm("Delete?")) return;
    try {
      await remove({ data: { token, id } });
      qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Deleted");
    }
    catch (err) { toast.error((err as Error).message); }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
      <motion.form onSubmit={publish} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 space-y-4 h-fit">
        <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-widest"><Megaphone className="h-4 w-4" /> New announcement</div>
        <h2 className="font-display text-xl font-bold">Broadcast</h2>
        <input required maxLength={200} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
        <input maxLength={120} placeholder="Wing (optional)" value={wing} onChange={(e) => setWing(e.target.value)} className="w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
        <textarea required maxLength={4000} placeholder="Message" rows={4} value={body} onChange={(e) => setBody(e.target.value)} className="w-full px-4 py-3 rounded-xl glass border border-border focus:border-primary outline-none" />
        <button disabled={busy} className="w-full h-11 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant disabled:opacity-50">{busy ? "Publishing…" : "Publish"}</button>
      </motion.form>
      <div className="space-y-3">
        {data.length === 0 && <div className="glass rounded-2xl p-6 text-sm text-muted-foreground text-center">No announcements yet.</div>}
        {data.map((a) => (
          <div key={a.id} className="glass-strong rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                {a.wing && <div className="text-[10px] uppercase tracking-widest text-gold">{a.wing}</div>}
                <h3 className="font-display font-semibold">{a.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
              </div>
              <button onClick={() => onDelete(a.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StationeryTab() {
  const { token } = usePortalAuth("admin");
  const qc = useQueryClient();
  const { data } = useStationery();
  const create = createStationery;
  const update = updateStationery;
  const remove = deleteStationery;
  const [editing, setEditing] = useState<StationeryItem | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [qty, setQty] = useState("0");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  function reset() {
    setEditing(null); setName(""); setPrice("0"); setQty("0"); setDesc(""); setImg(null);
  }

  function startEdit(it: StationeryItem) {
    setEditing(it);
    setName(it.name); setPrice(String(it.price)); setQty(String(it.quantity));
    setDesc(it.description || ""); setImg(it.image_url);
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      const payload = {
        token, name,
        price: Number(price),
        quantity: parseInt(qty, 10),
        description: desc || null,
        image_url: img,
      };
      if (editing) {
        await update({ data: { ...payload, id: editing.id } });
        toast.success("Item updated");
      } else {
        await create({ data: payload });
        toast.success("Item added");
      }
      qc.invalidateQueries({ queryKey: ["stationery_items"] });
      reset();
      setShowForm(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  }

  async function onDelete(id: string) {
    if (!token || !confirm("Delete this item?")) return;
    try {
      await remove({ data: { token, id } });
      qc.invalidateQueries({ queryKey: ["stationery_items"] });
      toast.success("Deleted");
    }
    catch (err) { toast.error((err as Error).message); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Stationery items ({data.length})</h2>
        <button onClick={() => { if (showForm) { reset(); } setShowForm(!showForm); }} className="h-10 px-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-2 shadow-elegant">
          <Plus className="h-4 w-4" /> {showForm ? "Close" : "New item"}
        </button>
      </div>
      {showForm && token && (
        <form onSubmit={submit} className="glass-strong rounded-3xl p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Item name</label>
              <input required maxLength={200} value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Price (₹)</label>
              <input type="number" min="0" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Quantity</label>
              <input type="number" min="0" step="1" required value={qty} onChange={(e) => setQty(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Description</label>
              <textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-2 w-full px-4 py-3 rounded-xl glass border border-border focus:border-primary outline-none" />
            </div>
            <div className="sm:col-span-2">
              <FileUploadField label="Product image" bucket="stationery" token={token} value={img} onChange={setImg} />
            </div>
          </div>
          <div className="flex gap-2">
            <button disabled={busy} className="h-11 px-6 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant disabled:opacity-50">{editing ? "Save changes" : "Add item"}</button>
            <button type="button" onClick={() => { reset(); setShowForm(false); }} className="h-11 px-4 rounded-xl glass border border-border text-sm">Cancel</button>
          </div>
        </form>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((it) => (
          <div key={it.id} className="glass-strong rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center">
              {it.image_url ? <img loading="lazy" decoding="async" src={it.image_url} alt={it.name} className="h-full w-full object-cover" /> : <Package className="h-12 w-12 text-primary/60" />}
            </div>
            <div className="p-4">
              <h3 className="font-display font-semibold">{it.name}</h3>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="gradient-text font-bold text-lg">₹{it.price}</span>
                <span className="text-muted-foreground">Stock: {it.quantity}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => startEdit(it)} className="h-8 px-3 rounded-lg glass border border-border hover:border-primary text-xs inline-flex items-center gap-1"><Pencil className="h-3 w-3" /> Edit</button>
                <button onClick={() => onDelete(it.id)} className="h-8 px-3 rounded-lg glass border border-border hover:border-destructive text-destructive text-xs inline-flex items-center gap-1"><Trash2 className="h-3 w-3" /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;
