import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import type { Program } from "@/hooks/use-programs";
import { WINGS } from "@/lib/madad-data";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export type ProgramCardRenderer = (p: Program) => React.ReactNode;

export function FoldedPrograms({
  programs,
  renderCard,
  searchable = true,
  filterWing = true,
  filterStatus = true,
  recentDays = 30,
  title = "Programs",
}: {
  programs: Program[];
  renderCard: ProgramCardRenderer;
  searchable?: boolean;
  filterWing?: boolean;
  filterStatus?: boolean;
  recentDays?: number;
  title?: string;
}) {
  const [q, setQ] = useState("");
  const [wing, setWing] = useState("All");
  const [status, setStatus] = useState("All");
  const [yearF, setYearF] = useState("All");
  const [monthF, setMonthF] = useState("All");

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      if (wing !== "All" && p.wing !== wing) return false;
      if (status !== "All" && p.status !== status) return false;
      const d = new Date(p.event_date);
      if (yearF !== "All" && d.getFullYear() !== Number(yearF)) return false;
      if (monthF !== "All" && d.getMonth() !== Number(monthF)) return false;
      if (q && !`${p.name} ${p.description ?? ""} ${p.venue ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [programs, q, wing, status, yearF, monthF]);

  const cutoff = useMemo(() => {
    const c = new Date();
    c.setDate(c.getDate() - recentDays);
    c.setHours(0,0,0,0);
    return c;
  }, [recentDays]);

  const recent = filtered.filter((p) => new Date(p.event_date) >= cutoff);
  const archive = filtered.filter((p) => new Date(p.event_date) < cutoff);

  const archiveByYear = useMemo(() => {
    const map = new Map<number, Map<number, Program[]>>();
    for (const p of archive) {
      const d = new Date(p.event_date);
      const y = d.getFullYear();
      const m = d.getMonth();
      if (!map.has(y)) map.set(y, new Map());
      const months = map.get(y)!;
      if (!months.has(m)) months.set(m, []);
      months.get(m)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [archive]);

  const years = useMemo(() => {
    const s = new Set<number>();
    programs.forEach(p => s.add(new Date(p.event_date).getFullYear()));
    return Array.from(s).sort((a, b) => b - a);
  }, [programs]);

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-2xl p-3 flex flex-wrap items-center gap-2">
        {searchable && (
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full h-9 pl-9 pr-3 rounded-lg glass border border-border focus:border-primary outline-none text-xs" />
          </div>
        )}
        {filterWing && (
          <select value={wing} onChange={(e) => setWing(e.target.value)} className="h-9 px-2 rounded-lg glass border border-border text-xs outline-none">
            <option value="All">All wings</option>
            {WINGS.map((w) => <option key={w.slug} value={w.slug}>{w.name}</option>)}
          </select>
        )}
        {filterStatus && (
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 px-2 rounded-lg glass border border-border text-xs outline-none">
            <option value="All">All statuses</option>
            <option value="draft">Draft</option>
            <option value="registration_open">Registration open</option>
            <option value="registration_closed">Registration closed</option>
            <option value="completed">Completed</option>
            <option value="result_published">Result published</option>
            <option value="archived">Archived</option>
          </select>
        )}
        <select value={yearF} onChange={(e) => setYearF(e.target.value)} className="h-9 px-2 rounded-lg glass border border-border text-xs outline-none">
          <option value="All">All years</option>
          {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
        </select>
        <select value={monthF} onChange={(e) => setMonthF(e.target.value)} className="h-9 px-2 rounded-lg glass border border-border text-xs outline-none">
          <option value="All">All months</option>
          {MONTHS.map((m, i) => <option key={m} value={String(i)}>{m}</option>)}
        </select>
      </div>

      <div>
        <h3 className="font-display text-base font-semibold mb-3 text-muted-foreground">{title} — recent ({recent.length})</h3>
        {recent.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">Nothing recent.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {recent.map((p) => <div key={p.id}>{renderCard(p)}</div>)}
          </div>
        )}
      </div>

      {archiveByYear.length > 0 && (
        <div>
          <h3 className="font-display text-base font-semibold mb-3 text-muted-foreground">Archive</h3>
          <div className="space-y-2">
            {archiveByYear.map(([y, months]) => (
              <YearAcc key={y} year={y} months={months} renderCard={renderCard} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function YearAcc({ year, months, renderCard }: { year: number; months: Map<number, Program[]>; renderCard: ProgramCardRenderer }) {
  const [open, setOpen] = useState(false);
  const total = Array.from(months.values()).reduce((n, a) => n + a.length, 0);
  const monthEntries = Array.from(months.entries()).sort((a, b) => b[0] - a[0]);
  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition">
        <div className="text-left">
          <div className="font-display font-bold text-lg">{year}</div>
          <div className="text-[11px] text-muted-foreground">{total} {total === 1 ? "program" : "programs"}</div>
        </div>
        <ChevronDown className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              {monthEntries.map(([m, items]) => <MonthAcc key={m} month={m} items={items} renderCard={renderCard} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MonthAcc({ month, items, renderCard }: { month: number; items: Program[]; renderCard: ProgramCardRenderer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl glass overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-primary/5 transition">
        <div className="text-sm font-semibold">{MONTHS[month]} <span className="text-muted-foreground ml-2 text-xs">({items.length})</span></div>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 pt-1 grid sm:grid-cols-2 gap-2">
              {items.map((p) => <div key={p.id}>{renderCard(p)}</div>)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
