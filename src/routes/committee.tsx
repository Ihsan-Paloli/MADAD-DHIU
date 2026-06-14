import { useDocumentMeta } from "@/lib/use-document-meta";
import { motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";
import { COMMITTEE } from "@/lib/madad-data";
import { getCorePhoto } from "@/lib/member-photos";
import { User } from "lucide-react";


function Committee() {
  useDocumentMeta({ title: 'Committee — MADAD', description: 'Core committee, office bearers and auditing wing of MADAD.' });

  return (
    <PageShell>
      <PageHeader eyebrow="Leadership" title="The Core Committee." description="Office bearers and members who steward MADAD's vision and operations." />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMMITTEE.map((m, i) => {
            const photo = getCorePhoto(m.role);
            return (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-strong rounded-2xl p-7 text-center hover:-translate-y-1 transition"
            >
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant overflow-hidden">
                {photo ? (
                  <img
                    src={photo}
                    alt={m.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary-foreground" />
                )}
              </div>
              <h3 className="mt-5 font-display font-semibold text-lg">{m.name}</h3>
              <div className="text-xs uppercase tracking-widest text-gold mt-1">{m.role}</div>
              <p className="mt-3 text-sm text-muted-foreground">{m.desc}</p>
            </motion.div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}

export default Committee;
