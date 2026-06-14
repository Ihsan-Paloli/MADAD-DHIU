import { useDocumentMeta } from "@/lib/use-document-meta";
import { motion } from "framer-motion";
import { PageShell, PageHeader } from "@/components/PageShell";
import { useAnnouncements } from "@/hooks/use-announcements";
import { Megaphone, Radio } from "lucide-react";


function Announcements() {
  useDocumentMeta({ title: 'Announcements — MADAD', description: 'Live announcements from MADAD admin and all 13 wings.' });

  const { data, loading } = useAnnouncements();
  return (
    <PageShell>
      <PageHeader
        eyebrow="Live"
        title="Announcements"
        description="Updates from the MADAD admin team — broadcast to the entire community in real time."
      />
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-muted-foreground mb-6">
            <Radio className="h-3 w-3 text-primary animate-pulse" /> Live feed · updates instantly
          </div>
          {loading ? (
            <div className="glass-strong rounded-2xl p-10 text-center text-muted-foreground">Loading…</div>
          ) : data.length === 0 ? (
            <div className="glass-strong rounded-2xl p-12 text-center">
              <Megaphone className="h-10 w-10 mx-auto text-gold/60" />
              <p className="mt-4 text-muted-foreground">No announcements yet. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((a, i) => (
                <motion.article
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 6) * 0.05 }}
                  className="glass-strong rounded-2xl p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      {a.wing && <div className="text-[11px] font-semibold uppercase tracking-widest text-gold">{a.wing}</div>}
                      <h3 className="mt-1 font-display font-semibold text-xl">{a.title}</h3>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(a.created_at).toLocaleString("en", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{a.body}</p>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

export default Announcements;
