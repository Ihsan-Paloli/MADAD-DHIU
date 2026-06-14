import { Link, useParams, Navigate } from "react-router-dom";import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { WINGS } from "@/lib/madad-data";
import { getMemberPhoto } from "@/lib/member-photos";
import { ArrowLeft, UserCheck, Users } from "lucide-react";


function WingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const wing = WINGS.find((w) => w.slug === slug);
  if (!wing) return <Navigate to="/wings" replace />;
  return (
    <PageShell>
      <section className="bg-hero pt-16 pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <Link to="/wings" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft className="h-4 w-4" /> All wings
          </Link>
          <div className="text-xs uppercase tracking-widest text-gold font-semibold">{wing.tagline}</div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-3 font-display text-4xl sm:text-5xl font-bold gradient-text">
            {wing.name}
          </motion.h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl">{wing.description}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6 grid md:grid-cols-3 gap-6">
          <LeaderCard role="Chairman" name={wing.chairman} icon={UserCheck} photo={getMemberPhoto(wing.slug, "chairman")} accent />
          <LeaderCard role="Convenor 1" name={wing.convenor1} icon={Users} photo={getMemberPhoto(wing.slug, "convenor1")} />
          <LeaderCard role="Convenor 2" name={wing.convenor2} icon={Users} photo={getMemberPhoto(wing.slug, "convenor2")} />
        </div>
      </section>

    </PageShell>
  );
}

function LeaderCard({ role, name, icon: Icon, accent, photo }: { role: string; name: string; icon: React.ComponentType<{ className?: string }>; accent?: boolean; photo?: string }) {
  return (
    <div className={`glass-strong rounded-2xl p-6 text-center ${accent ? "ring-1 ring-gold/40" : ""}`}>
      <div className={`mx-auto w-32 aspect-[3/4] rounded-xl overflow-hidden flex items-center justify-center shadow-elegant ${accent ? "bg-gradient-gold" : "bg-gradient-primary"}`}>
        {photo ? (
          <img src={photo} alt={name} loading="lazy" className="w-full h-full object-cover object-center" />
        ) : (
          <Icon className="h-10 w-10 text-primary-foreground" />
        )}
      </div>
      <div className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">{role}</div>
      <div className="mt-1 font-display font-semibold">{name}</div>
    </div>
  );
}

export default WingDetail;
