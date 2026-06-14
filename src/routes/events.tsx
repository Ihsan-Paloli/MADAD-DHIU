import { useDocumentMeta } from "@/lib/use-document-meta";
import { Link } from "react-router-dom";import { motion, AnimatePresence } from "framer-motion";
import { memo, useMemo, useState } from "react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { usePrograms, type Program } from "@/hooks/use-programs";
import { WINGS, resolveOrgName } from "@/lib/madad-data";
import { Calendar, Clock, MapPin, Trophy, ChevronDown, Search } from "lucide-react";


function wingName(slug: string) {
  return resolveOrgName(slug);
}

const EventCard = memo(function EventCard({ p, i, dim, twoCol }: { p: Program; i: number; dim?: boolean; twoCol?: boolean }) {
  const d = new Date(p.event_date);
  // In a 2-column timeline, only the LEFT-column card should render the timeline dot.
  // Otherwise the right-column card draws a duplicate dot in the gutter between columns.
  const hideDotOnLg = twoCol && i % 2 === 1;
  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ delay: Math.min(i * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: "transform, opacity" }}
      className={`relative mb-5 sm:mb-7 glass-strong rounded-2xl sm:rounded-3xl p-5 sm:p-7 ${dim ? "opacity-80" : ""}`}
    >
      <span className={`absolute -left-[22px] sm:-left-[34px] top-7 h-4 w-4 rounded-full bg-gradient-primary ring-4 ring-background ${hideDotOnLg ? "lg:hidden" : ""}`} />
      <div className="flex items-start gap-4 sm:gap-5">
        {/* Date + poster: compact, inline on desktop so card hugs content */}
        <div className="flex items-center gap-2 shrink-0 sm:order-last">
          {p.poster_url && (
            <img loading="lazy" decoding="async" src={p.poster_url} alt={p.name} className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover glass" />
          )}
          <div className="glass rounded-xl px-3 py-2 text-center min-w-[60px] sm:min-w-[68px]">
            <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{d.toLocaleString("en", { month: "short" })}</div>
            <div className="font-display font-bold text-xl sm:text-2xl gradient-text leading-tight">{d.getDate()}</div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gold">{wingName(p.wing)}</span>
            {p.result_status === "published" && (
              <Link to={`/results/${p.id}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition">
                <Trophy className="h-3 w-3" /> Result published
              </Link>
            )}
            {p.result_status === "draft" && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">Result pending</span>
            )}
          </div>
          <h3 className="mt-1.5 font-display font-semibold text-lg sm:text-xl leading-snug">{p.name}</h3>
          {p.description && <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed line-clamp-3 sm:line-clamp-none">{p.description}</p>}
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary shrink-0" /> {d.toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
            {p.event_time && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary shrink-0" /> {p.event_time.slice(0, 5)}{p.end_time ? ` – ${p.end_time.slice(0, 5)}` : ""}</span>}
            {p.venue && <span className="flex items-center gap-1.5 min-w-0"><MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> <span className="truncate">{p.venue}</span></span>}
          </div>
        </div>
      </div>
    </motion.article>
  );
});

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function Events() {
  useDocumentMeta({ title: 'Events Diary — MADAD', description: 'Upcoming and past programs across all 13 wings of MADAD.' });

  const { upcoming, past, loading } = usePrograms();
  const [q, setQ] = useState("");
  const [wingFilter, setWingFilter] = useState<string>("All");

  const filteredUpcoming = useMemo(() => upcoming.filter(filterFn(q, wingFilter)), [upcoming, q, wingFilter]);
  const filteredPast = useMemo(() => past.filter(filterFn(q, wingFilter)), [past, q, wingFilter]);

  // Split: recent (last 30 days) vs archive (older, grouped by Year > Month)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const recentPast = filteredPast.filter((p) => new Date(p.event_date) >= cutoff);
  const archivePast = filteredPast.filter((p) => new Date(p.event_date) < cutoff);

  const archiveByYear = useMemo(() => {
    const map = new Map<number, Map<number, Program[]>>();
    for (const p of archivePast) {
      const d = new Date(p.event_date);
      const y = d.getFullYear();
      const m = d.getMonth();
      if (!map.has(y)) map.set(y, new Map());
      const months = map.get(y)!;
      if (!months.has(m)) months.set(m, []);
      months.get(m)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [archivePast]);

  return (
    <PageShell>
      <PageHeader eyebrow="Events Diary" title="Programs at a glance." description="The official calendar of MADAD — events from every wing, in chronological order." />
      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-5xl lg:max-w-7xl px-4 sm:px-6 lg:px-10 space-y-10 sm:space-y-12">
          {/* Filters */}
          <div className="glass-strong rounded-2xl p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search programs…" className="w-full h-10 pl-9 pr-3 rounded-xl glass border border-border focus:border-primary outline-none text-sm" />
            </div>
            <select value={wingFilter} onChange={(e) => setWingFilter(e.target.value)} className="h-10 px-3 rounded-xl glass border border-border text-sm outline-none">
              <option value="All">All wings</option>
              {WINGS.map((w) => <option key={w.slug} value={w.slug}>{w.name}</option>)}
            </select>
          </div>

          {/* Upcoming */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6 gradient-text">Upcoming events</h2>
            {loading && <div className="text-muted-foreground text-sm">Loading…</div>}
            {!loading && filteredUpcoming.length === 0 && (
              <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">No upcoming events.</div>
            )}
            <div className="relative pl-5 sm:pl-10">
              {filteredUpcoming.length > 0 && <div className="absolute left-1.5 sm:left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-gold to-transparent" />}
              <div className={filteredUpcoming.length > 1 ? "lg:grid lg:grid-cols-2 lg:gap-x-8" : ""}>
                {filteredUpcoming.map((p, i) => <EventCard key={p.id} p={p} i={i} twoCol={filteredUpcoming.length > 1} />)}
              </div>
            </div>
          </div>

          {/* Recent past */}
          {recentPast.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-bold mb-6 text-muted-foreground">Recent events</h2>
              <div className="relative pl-5 sm:pl-10">
                <div className="absolute left-1.5 sm:left-4 top-0 bottom-0 w-px bg-border" />
                <div className={recentPast.length > 1 ? "lg:grid lg:grid-cols-2 lg:gap-x-8" : ""}>
                  {recentPast.map((p, i) => <EventCard key={p.id} p={p} i={i} dim twoCol={recentPast.length > 1} />)}
                </div>
              </div>
            </div>
          )}

          {/* Archive */}
          {archiveByYear.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-bold mb-6 text-muted-foreground">Archive</h2>
              <div className="space-y-3">
                {archiveByYear.map(([year, months]) => (
                  <YearAccordion key={year} year={year} months={months} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function filterFn(q: string, wing: string) {
  return (p: Program) => {
    if (wing !== "All" && p.wing !== wing) return false;
    if (q && !`${p.name} ${p.description ?? ""} ${p.venue ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  };
}

function YearAccordion({ year, months }: { year: number; months: Map<number, Program[]> }) {
  const [open, setOpen] = useState(false);
  const total = Array.from(months.values()).reduce((n, arr) => n + arr.length, 0);
  const monthEntries = Array.from(months.entries()).sort((a, b) => b[0] - a[0]);
  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 hover:bg-primary/5 transition">
        <div className="text-left">
          <div className="font-display font-bold text-xl">{year}</div>
          <div className="text-xs text-muted-foreground">{total} {total === 1 ? "program" : "programs"}</div>
        </div>
        <ChevronDown className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
              {monthEntries.map(([m, items]) => (
                <MonthGroup key={m} month={m} items={items} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MonthGroup({ month, items }: { month: number; items: Program[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl glass overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition">
        <div className="text-sm font-semibold">{MONTHS[month]} <span className="text-muted-foreground ml-2 text-xs">({items.length})</span></div>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <ul className="px-4 pb-4 pt-1 space-y-2">
              {items.map((p) => {
                const d = new Date(p.event_date);
                return (
                  <li key={p.id} className="flex items-center gap-3 text-sm border-b border-border/50 last:border-0 pb-2 last:pb-0">
                    <div className="w-10 text-center">
                      <div className="font-display font-bold text-lg gradient-text leading-none">{d.getDate()}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{wingName(p.wing)}{p.venue ? ` · ${p.venue}` : ""}</div>
                    </div>
                    {p.result_status === "published" && (
                      <Link to={`/results/${p.id}`} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        Result
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Events;
