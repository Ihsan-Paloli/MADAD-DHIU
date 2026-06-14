import { useDocumentMeta } from "@/lib/use-document-meta";
import { Link } from "react-router-dom";import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { Logo } from "@/components/Logo";
import { ShieldCheck, Calendar, BarChart3 } from "lucide-react";


const PORTALS = [
  { to: "/admin", title: "Admin Portal", desc: "Full management — announcements, programs, wings, committee and credentials.", icon: ShieldCheck, accent: "from-primary to-emerald-deep" },
  { to: "/events-portal", title: "Events Portal", desc: "For all 13 wings — register, edit and manage your wing's programs.", icon: Calendar, accent: "from-emerald-deep to-primary" },
  { to: "/auditing", title: "Auditing Portal", desc: "Exclusive to the Auditing Wing — analytics, statistics and reports.", icon: BarChart3, accent: "from-gold to-primary" },
] as const;

function Login() {
  useDocumentMeta({ title: 'Login Portal — MADAD' });

  return (
    <PageShell>
      <section className="relative bg-hero py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <Logo className="mx-auto h-16 w-16" />
            <h1 className="mt-6 font-display text-4xl sm:text-5xl font-bold gradient-text">Choose your portal</h1>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Three secure entry points — each tailored to a different role within MADAD.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {PORTALS.map((p, i) => (
              <motion.div
                key={p.to}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={p.to}
                  className="group block text-left glass-strong rounded-2xl p-7 hover:-translate-y-1 hover:shadow-elegant transition-all h-full"
                >
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${p.accent} flex items-center justify-center shadow-elegant`}>
                    <p.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="mt-5 font-display font-semibold text-xl">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  <div className="mt-5 text-sm font-semibold text-primary group-hover:underline">Enter portal →</div>
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="mt-10 text-center text-xs text-muted-foreground max-w-md mx-auto">
            Each portal is protected by its own password — contact the MADAD admin team for access.
          </p>
          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back to home</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default Login;
