import { useDocumentMeta } from "@/lib/use-document-meta";
import { motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";
import { useStationery } from "@/hooks/use-stationery";
import { Package } from "lucide-react";


function statusOf(qty: number) {
  if (qty === 0) return { label: "Out of Stock", cls: "bg-destructive/15 text-destructive" };
  if (qty < 20) return { label: "Low Stock", cls: "bg-gold/20 text-gold-foreground" };
  return { label: "In Stock", cls: "bg-primary/15 text-primary" };
}

function Stationery() {
  useDocumentMeta({ title: 'Stationery — MADAD', description: 'Student stationery and essentials available through MADAD.' });

  const { data, loading } = useStationery();
  return (
    <PageShell>
      <PageHeader eyebrow="Student Store" title="Stationery & Essentials." description="Browse the items available through the MADAD student store. Prices and stock are updated live by administrators." />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          {loading && <div className="text-center text-muted-foreground">Loading…</div>}
          {!loading && data.length === 0 && (
            <div className="glass rounded-2xl p-10 text-center text-muted-foreground">No items available yet.</div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((item, i) => {
              const s = statusOf(item.quantity);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-strong rounded-2xl overflow-hidden group hover:-translate-y-1 transition"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 via-muted to-gold/10 flex items-center justify-center relative overflow-hidden">
                    {item.image_url ? (
                      <img loading="lazy" decoding="async" src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-16 w-16 text-primary/60" />
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full glass ${s.cls}`}>{s.label}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-semibold text-lg">{item.name}</h3>
                    {item.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.description}</p>}
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">Price</div>
                        <div className="font-display font-bold text-2xl gradient-text">₹{item.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">In stock</div>
                        <div className="font-display font-semibold">{item.quantity}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default Stationery;
