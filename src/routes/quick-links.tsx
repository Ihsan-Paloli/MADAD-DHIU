import { useDocumentMeta } from "@/lib/use-document-meta";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { useQuickLinks, type QuickLink } from "@/hooks/use-quick-links";
import { ExternalLink, Search, Link as LinkIcon } from "lucide-react";


const CAT_LABEL: Record<QuickLink["category"], string> = {
  events: "Events",
  academic: "Academic",
  institutional: "Institutional",
  partner: "Partner Platforms",
  media: "Media",
  other: "Other",
};

function QuickLinks() {
  useDocumentMeta({ title: 'Quick Links — MADAD', description: 'Connected platforms, partner portals, and official websites linked from MADAD.' });

  const { data, loading } = useQuickLinks();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const filtered = useMemo(() => data.filter((r) => {
    if (cat !== "All" && r.category !== cat) return false;
    if (q && !`${r.title} ${r.description ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [data, q, cat]);

  const groups = useMemo(() => {
    const map = new Map<string, QuickLink[]>();
    for (const r of filtered) {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category)!.push(r);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <PageShell>
      <PageHeader eyebrow="Quick Links" title="Connected platforms." description="Jump to official websites, partner portals, and platforms linked with MADAD." />
      <section className="py-10">
        <div className="mx-auto max-w-5xl px-6 space-y-8">
          <div className="glass-strong rounded-2xl p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search links…" className="w-full h-10 pl-9 pr-3 rounded-xl glass border border-border focus:border-primary outline-none text-sm" />
            </div>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-10 px-3 rounded-xl glass border border-border text-sm outline-none">
              <option value="All">All categories</option>
              {Object.entries(CAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {loading && <div className="text-muted-foreground text-sm">Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center">
              <LinkIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <div className="text-sm text-muted-foreground">No links yet.</div>
            </div>
          )}

          {groups.map(([category, items]) => (
            <div key={category}>
              <h2 className="font-display text-xl font-bold mb-4 gradient-text">{CAT_LABEL[category as QuickLink["category"]] ?? category}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((r, i) => (
                  <motion.a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    className="glass-strong rounded-2xl p-5 hover:border-primary border border-transparent transition group flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-3">
                      {r.icon_url ? (
                        <img loading="lazy" decoding="async" src={r.icon_url} alt="" className="h-12 w-12 rounded-xl object-cover glass" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-gradient-primary/10 flex items-center justify-center"><LinkIcon className="h-5 w-5 text-primary" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-semibold truncate">{r.title}</div>
                        <div className="text-[10px] uppercase tracking-widest text-gold mt-0.5">{CAT_LABEL[r.category]}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
                    </div>
                    {r.description && <p className="text-sm text-muted-foreground line-clamp-3">{r.description}</p>}
                  </motion.a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export default QuickLinks;
