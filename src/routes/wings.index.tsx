import { useDocumentMeta } from "@/lib/use-document-meta";
import { Link } from "react-router-dom";import { motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";
import { WINGS } from "@/lib/madad-data";
import { ArrowRight } from "lucide-react";


function WingsPage() {
  useDocumentMeta({ title: 'Wings — MADAD', description: 'Explore the thirteen specialized wings of MADAD.' });

  return (
    <PageShell>
      <PageHeader eyebrow="13 Wings" title="Specialized excellence." description="Each wing is led by a Chairman and two Convenors, coordinating activities throughout the academic year." />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WINGS.map((w, i) => (
            <motion.div
              key={w.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
             <Link
                  to={`/wings/${w.slug}`}
                  className="group block glass-strong rounded-2xl p-7 hover:-translate-y-1 hover:shadow-elegant transition-all h-full"
                >
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground text-lg shadow-elegant">
                    {w.name.charAt(0)}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-gold">Wing {String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 font-display font-semibold text-lg">{w.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{w.tagline}</p>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-2">{w.description}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  View details <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export default WingsPage;
