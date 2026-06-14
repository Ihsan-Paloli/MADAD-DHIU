import { useDocumentMeta } from "@/lib/use-document-meta";
import { Link } from "react-router-dom";import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageShell, PageHeader } from "@/components/PageShell";
import { PortalGate } from "@/components/PortalGate";
import { usePortalAuth } from "@/hooks/use-portal-auth";
import { usePrograms, type Program } from "@/hooks/use-programs";
import { createProgram, updateProgram } from "@/lib/programs.functions";
import { ProgramForm, emptyProgramValues, programToValues, type ProgramFormValues } from "@/components/ProgramForm";
import { WINGS } from "@/lib/madad-data";
import { Calendar, LogOut, Plus, Pencil } from "lucide-react";
import { ManageResultButton } from "@/components/ManageResultButton";
import { FoldedPrograms } from "@/components/FoldedPrograms";
import { toast } from "sonner";


function EventsPortal() {
  useDocumentMeta({ title: 'Events Portal — MADAD' });

  return (
    <PageShell>
      <PageHeader eyebrow="Events Portal" title="Wing Event Management" description="For all 13 wings — register and manage your wing's programs." />
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-6">
          <PortalGate
            portal="events"
            eyebrow="Events Access"
            title="Events Portal"
            description="Wing leads — select your wing and sign in to coordinate programs."
            requireWing
          >
            {(signOut) => <EventsDashboard signOut={signOut} />}
          </PortalGate>
        </div>
      </section>
    </PageShell>
  );
}

function decodeWing(token: string | null): string | null {
  if (!token) return null;
  try {
    const [b64] = token.split(".");
    const payload = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
    const parts = payload.split(".");
    return parts[2] || null;
  } catch { return null; }
}

function EventsDashboard({ signOut }: { signOut: () => void }) {
  const { token } = usePortalAuth("events");
  const qc = useQueryClient();
  const wingSlug = useMemo(() => decodeWing(token), [token]);
  const wing = WINGS.find((w) => w.slug === wingSlug);
  const { data: programs } = usePrograms();
  const create = createProgram;
  const update = updateProgram;

  const [editing, setEditing] = useState<Program | null>(null);
  const [values, setValues] = useState<ProgramFormValues>(emptyProgramValues(wingSlug || ""));
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const myPrograms = programs.filter((p) => p.wing === wingSlug || p.created_by_portal === wingSlug);
  const others = programs.filter((p) => !(p.wing === wingSlug || p.created_by_portal === wingSlug));

  async function submit() {
    if (!token) return;
    setBusy(true);
    try {
      const payload = {
        token,
        name: values.name,
        wing: wingSlug || values.wing,
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
        toast.success("Program registered");
      }
      qc.invalidateQueries({ queryKey: ["programs"] });
      setValues(emptyProgramValues(wingSlug || ""));
      setEditing(null);
      setShowForm(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(p: Program) {
    setEditing(p);
    setValues(programToValues(p));
    setShowForm(true);
  }
  function startCreate() {
    setEditing(null);
    setValues(emptyProgramValues(wingSlug || ""));
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-gold flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {wing?.name ?? "Wing"}
          </div>
          <h2 className="font-display text-2xl font-bold mt-1">Your wing dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Register new programs and edit the ones owned by your wing.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={startCreate} className="h-10 px-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-2 shadow-elegant">
            <Plus className="h-4 w-4" /> New program
          </button>
          <button onClick={signOut} className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1.5">
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>
      </div>

      {showForm && token && (
        <ProgramForm
          values={values}
          onChange={setValues}
          token={token}
          wingLocked
          submitting={busy}
          submitLabel={editing ? "Save changes" : "Register program"}
          onSubmit={submit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      <div>
        <h3 className="font-display text-lg font-semibold mb-3">Your wing's programs ({myPrograms.length})</h3>
        {myPrograms.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-sm text-muted-foreground text-center">No programs yet. Click "New program" to register one.</div>
        ) : (
          <FoldedPrograms
            programs={myPrograms}
            filterWing={false}
            renderCard={(p) => (
              <div className="glass-strong rounded-2xl p-4 flex flex-col gap-3 h-full">
                <div className="flex gap-3">
                  {p.poster_url && <img loading="lazy" decoding="async" src={p.poster_url} alt="" className="h-14 w-14 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase text-gold">{new Date(p.event_date).toLocaleDateString()} {p.event_time?.slice(0,5)}</span>
                      {p.archived_at && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">archived</span>}
                      {p.result_status === "published" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">Result published</span>}
                      {p.result_status === "draft" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Result draft</span>}
                    </div>
                    <h4 className="font-display font-semibold mt-0.5 truncate">{p.name}</h4>
                    {p.venue && <div className="text-[11px] text-muted-foreground">{p.venue}</div>}
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      {token && <ManageResultButton programId={p.id} programName={p.name} token={token} />}
                      <button onClick={() => startEdit(p)} className="h-7 px-2 rounded-lg glass border border-border hover:border-primary text-[11px] inline-flex items-center gap-1">
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          />
        )}
      </div>

      {others.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold mb-3 text-muted-foreground">Other wings ({others.length})</h3>
          <FoldedPrograms
            programs={others}
            renderCard={(p) => (
              <div className="glass rounded-xl p-3">
                <div className="text-[10px] uppercase text-gold">{WINGS.find(w => w.slug === p.wing)?.name ?? p.wing}</div>
                <div className="font-medium text-sm truncate">{p.name}</div>
                <div className="text-[11px] text-muted-foreground">{new Date(p.event_date).toLocaleDateString()}</div>
              </div>
            )}
          />
        </div>
      )}

      <div className="text-center">
        <Link to="/" className="text-xs text-muted-foreground hover:text-primary">← Back to home</Link>
      </div>
    </div>
  );
}

export default EventsPortal;
