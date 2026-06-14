import { useDocumentMeta } from "@/lib/use-document-meta";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { Image as ImageIcon, Play, Search } from "lucide-react";
import { useGallery } from "@/hooks/use-gallery";
import { WINGS } from "@/lib/madad-data";
import { MediaLightbox } from "@/components/MediaLightbox";
import { isVideoUrl } from "@/lib/media-utils";


const CATEGORIES = ["All", "Events", "Wings", "Cultural", "Sports", "Academic"] as const;

function wingName(slug: string | null) {
  if (!slug) return null;
  return WINGS.find((w) => w.slug === slug)?.name ?? slug;
}

function Gallery() {
  useDocumentMeta({ title: 'Gallery — MADAD', description: 'Visual memories from MADAD events, wings and programs.' });

  const { data, loading } = useGallery();
  const [filter, setFilter] = useState<string>("All");
  const [year, setYear] = useState<string>("All");
  const [q, setQ] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const years = useMemo(() => {
    const s = new Set<number>();
    data.forEach((p) => p.event_year && s.add(p.event_year));
    return ["All", ...Array.from(s).sort((a, b) => b - a).map(String)];
  }, [data]);

  const items = useMemo(() => {
    return data.filter((p) => {
      if (filter !== "All" && p.category !== filter) return false;
      if (year !== "All" && String(p.event_year) !== year) return false;
      if (q && !(p.caption || "").toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [data, filter, year, q]);

  return (
    <PageShell>
      <PageHeader eyebrow="Memories" title="MADAD Gallery." description="A growing collection of moments captured across our programs and wings." />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition ${
                  filter === c ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "glass hover:bg-primary/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search captions…"
                className="h-10 pl-9 pr-3 rounded-full glass border border-border focus:border-primary outline-none text-sm w-64"
              />
            </div>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="h-10 px-3 rounded-full glass border border-border text-sm outline-none">
              {years.map((y) => <option key={y} value={y}>{y === "All" ? "All years" : y}</option>)}
            </select>
          </div>

          {loading && <div className="text-center text-sm text-muted-foreground">Loading…</div>}
          {!loading && items.length === 0 && (
            <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">No media match your filters yet.</div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((it, i) => {
              const video = isVideoUrl(it.image_url);
              return (
                <motion.button
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  key={it.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  className="glass-strong rounded-2xl overflow-hidden relative group cursor-pointer aspect-square text-left focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={it.caption || (video ? "Play video" : "Open photo")}
                >
                  {it.image_url ? (
                    video ? (
                      <>
                        <video
                          src={it.image_url}
                          muted
                          playsInline
                          preload="metadata"
                          className="absolute inset-0 h-full w-full object-cover bg-black"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="h-12 w-12 rounded-full bg-background/70 backdrop-blur inline-flex items-center justify-center shadow-elegant">
                            <Play className="h-5 w-5 ml-0.5 text-primary" />
                          </span>
                        </div>
                      </>
                    ) : (
                      <img loading="lazy" decoding="async" src={it.image_url} alt={it.caption || ""} className="absolute inset-0 h-full w-full object-cover" />
                    )
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-gold/20 flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-primary/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gold">{it.category || "Uncategorised"} · {it.event_year ?? "—"}</div>
                      {it.caption && <div className="font-display font-semibold text-sm mt-0.5 line-clamp-2">{it.caption}</div>}
                      {wingName(it.wing) && <div className="text-xs text-muted-foreground mt-0.5">{wingName(it.wing)}</div>}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {openIndex !== null && (
        <MediaLightbox
          items={items}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      )}
    </PageShell>
  );
}

export default Gallery;
