import { useDocumentMeta } from "@/lib/use-document-meta";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { useAchievements, type Achievement } from "@/hooks/use-achievements";
import { Trophy, Search, ChevronDown, FileText } from "lucide-react";


function AchievementHall() {
  useDocumentMeta({ title: 'Achievement Hall — MADAD', description: 'Recognitions, winners, and milestones across all MADAD wings.' });

  const { data, loading } = useAchievements();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [year, setYear] = useState("All");

  const cats = useMemo(() => Array.from(new Set(data.map(d => d.category))).sort(), [data]);
  const years = useMemo(() => Array.from(new Set(data.map(d => d.achievement_year))).sort((a,b) => b-a), [data]);

  const filtered = useMemo(() => data.filter((r) => {
    if (cat !== "All" && r.category !== cat) return false;
    if (year !== "All" && r.achievement_year !== Number(year)) return false;
    if (q && !`${r.title} ${r.description ?? ""} ${r.category}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [data, q, cat, year]);

  const byYear = useMemo(() => {
    const m = new Map<number, Map<string, Achievement[]>>();
    for (const r of filtered) {
      if (!m.has(r.achievement_year)) m.set(r.achievement_year, new Map());
      const cats = m.get(r.achievement_year)!;
      if (!cats.has(r.category)) cats.set(r.category, []);
      cats.get(r.category)!.push(r);
    }
    return Array.from(m.entries()).sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  return (
    <PageShell>
      <PageHeader eyebrow="Achievement Hall" title="Milestones & recognitions." description="A living record of awards, winners, and special moments earned by MADAD wings." />
      <section className="py-10">
        <div className="mx-auto max-w-5xl px-6 space-y-8">
          <div className="glass-strong rounded-2xl p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search achievements…" className="w-full h-10 pl-9 pr-3 rounded-xl glass border border-border focus:border-primary outline-none text-sm" />
            </div>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-10 px-3 rounded-xl glass border border-border text-sm outline-none">
              <option value="All">All categories</option>
              {cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="h-10 px-3 rounded-xl glass border border-border text-sm outline-none">
              <option value="All">All years</option>
              {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          </div>

          {loading && <div className="text-muted-foreground text-sm">Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center">
              <Trophy className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <div className="text-sm text-muted-foreground">No achievements yet.</div>
            </div>
          )}

          {byYear.map(([y, catsMap]) => (
            <YearBlock key={y} year={y} catsMap={catsMap} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function YearBlock({ year, catsMap }: { year: number; catsMap: Map<string, Achievement[]> }) {
  const [open, setOpen] = useState(true);
  const total = Array.from(catsMap.values()).reduce((n, a) => n + a.length, 0);
  const entries = Array.from(catsMap.entries()).sort();
  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 hover:bg-primary/5 transition">
        <div className="text-left">
          <div className="font-display font-bold text-xl gradient-text">{year}</div>
          <div className="text-xs text-muted-foreground">{total} {total === 1 ? "achievement" : "achievements"}</div>
        </div>
        <ChevronDown className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
              {entries.map(([catName, items]) => (
                <div key={catName}>
                  <div className="text-xs font-semibold uppercase tracking-widest text-gold mb-2">{catName}</div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {items.map((r) => <AchCard key={r.id} r={r} />)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AchCard({ r }: { r: Achievement }) {
  return (
    <motion.article initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-2xl p-4 flex gap-3">
      {r.photo_url ? (
        <img loading="lazy" decoding="async" src={r.photo_url} alt="" className="h-20 w-20 rounded-lg object-cover" />
      ) : (
        <div className="h-20 w-20 rounded-lg bg-gradient-primary/10 flex items-center justify-center"><Trophy className="h-7 w-7 text-gold" /></div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {r.level && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase">{r.level}</span>}
          {r.achievement_date && <span className="text-[10px] text-muted-foreground">{new Date(r.achievement_date).toLocaleDateString()}</span>}
        </div>
        <h3 className="font-display font-semibold mt-0.5">{r.title}</h3>
        {r.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{r.description}</p>}
        {r.certificate_url && (
          <a href={r.certificate_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <FileText className="h-3 w-3" /> Certificate
          </a>
        )}
      </div>
    </motion.article>
  );
}

export default AchievementHall;
