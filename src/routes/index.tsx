import { useDocumentMeta } from "@/lib/use-document-meta";
import { Link } from "react-router-dom";import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, Calendar, Users, Layers, Award, ChevronRight, Radio, ExternalLink, Trophy } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Logo } from "@/components/Logo";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { STATS, WINGS, COMMITTEE } from "@/lib/madad-data";
import { usePrograms } from "@/hooks/use-programs";
import { useAnnouncements } from "@/hooks/use-announcements";
import { useAchievements } from "@/hooks/use-achievements";
import { useQuickLinks } from "@/hooks/use-quick-links";


function Home() {
  useDocumentMeta({ title: 'MADAD — Medium for Associative and Directive Activities of Darul Huda', description: 'Official digital platform of MADAD — events, wings, committee, gallery and student services of Darul Huda Islamic University.' });

  return (
    <PageShell>
      <Hero />
      <Stats />
      <AboutPreview />
      <UnionPreview />
      <Announcements />
      <UpcomingPrograms />
      <AchievementsPreview />
      <QuickLinksPreview />
    </PageShell>
  );
}

function AchievementsPreview() {
  const { data } = useAchievements();
  const top = data.slice(0, 3);
  if (top.length === 0) return null;
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Recognition" title="Recent Achievements" action={{ to: "/achievements", label: "All achievements" }} />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {top.map((a, i) => (
            <motion.article
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-strong rounded-2xl overflow-hidden group hover:shadow-elegant transition"
            >
              {a.photo_url ? (
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img src={a.photo_url} alt={a.title} loading="lazy" decoding="async" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-gradient-primary flex items-center justify-center">
                  <Trophy className="h-12 w-12 text-primary-foreground/60" />
                </div>
              )}
              <div className="p-5">
                <div className="text-[10px] uppercase tracking-widest text-gold font-semibold">{a.level || a.category}</div>
                <h3 className="mt-1 font-display font-semibold line-clamp-2">{a.title}</h3>
                <div className="mt-2 text-xs text-muted-foreground">{a.achievement_date ? new Date(a.achievement_date).toLocaleDateString() : a.achievement_year}</div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickLinksPreview() {
  const { data } = useQuickLinks();
  const top = data.slice(0, 6);
  if (top.length === 0) return null;
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Resources" title="Quick Links" action={{ to: "/quick-links", label: "All links" }} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((l, i) => (
            <motion.a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-strong rounded-2xl p-5 flex items-center gap-4 hover:shadow-elegant transition group"
            >
              {l.icon_url ? (
                <img src={l.icon_url} alt="" loading="lazy" decoding="async" className="h-12 w-12 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                  <ExternalLink className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-gold font-semibold">{l.category}</div>
                <div className="font-display font-semibold truncate group-hover:text-primary transition">{l.title}</div>
                {l.description && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{l.description}</div>}
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden -mt-28 sm:-mt-32 pt-36 sm:pt-44 pb-24 bg-hero [contain:layout_paint] [content-visibility:auto]">
      {/* Floating decor */}
      <FloatingBlob className="top-10 -left-20 w-96 h-96 bg-primary/30" />
      <FloatingBlob className="bottom-0 -right-20 w-[28rem] h-[28rem] bg-gold/20" delay={0.4} />
      <FloatingBlob className="top-1/3 right-1/4 w-64 h-64 bg-emerald-deep/20" delay={0.8} />

      <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span className="text-xs font-semibold tracking-widest uppercase text-foreground/80">Est. Darul Huda · Since 1986</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
          >
            Where <span className="gradient-gold-text">scholarship</span>
            <br />
            meets <span className="gradient-text">leadership.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            MADAD — the Medium for Associative and Directive Activities of Darul Huda —
            unites 13 specialized wings under one institutional vision: nurturing the next
            generation of scholars, leaders and creatives.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              to="/wings"
              className="group inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant hover:shadow-gold transition-all hover:-translate-y-0.5"
            >
              Explore the Wings
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl glass-strong font-semibold hover:bg-primary/5 transition"
            >
              <Calendar className="h-4 w-4" /> Events Diary
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-center gap-6 text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-2"><Award className="h-4 w-4 text-gold" /> Affiliated Institution</div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> 210+ Students</div>
          </motion.div>
        </div>

        {/* Logo showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative will-change-transform transform-gpu"
        >
          <div className="relative mx-auto aspect-square max-w-md">
            <motion.div
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              style={{ willChange: "transform" }}
              className="absolute inset-0 rounded-full border border-dashed border-gold/40 transform-gpu"
            />
            <motion.div
              animate={reduce ? undefined : { rotate: -360 }}
              transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
              style={{ willChange: "transform" }}
              className="absolute inset-8 rounded-full border border-dashed border-primary/30 transform-gpu"
            />
            <div className="absolute inset-12 rounded-full glass-strong shadow-elegant flex items-center justify-center p-10">
              <Logo className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
            {/* Floating mini cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -left-4 top-12 glass-strong rounded-2xl p-4 shadow-elegant"
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Active Wings</div>
              <div className="font-display font-bold text-2xl gradient-text">13</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -right-4 bottom-16 glass-strong rounded-2xl p-4 shadow-elegant"
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Programs</div>
              <div className="font-display font-bold text-2xl gradient-gold-text">500+</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FloatingBlob({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.4, delay }}
      style={{ willChange: "transform, opacity" }}
      className={`absolute rounded-full blur-3xl pointer-events-none transform-gpu ${className}`}
    />
  );
}

function Stats() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="glass-strong rounded-3xl p-8 sm:p-12 shadow-elegant">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 [&>*:last-child:nth-child(odd)]:col-span-2 md:[&>*:last-child:nth-child(odd)]:col-span-1">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl gradient-text">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-2 text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutPreview() {
  const pillars = [
    { icon: Sparkles, title: "Vision", body: "To cultivate confident, articulate and ethical leaders rooted in Islamic scholarship." },
    { icon: Award, title: "Mission", body: "To provide platforms for student expression, leadership, service and creativity." },
    { icon: Layers, title: "Objectives", body: "Coordinate 13 wings, organize programs, publish reports and serve the student body." },
  ];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="About MADAD" title="A union built on purpose." />
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-strong rounded-2xl p-8 hover:-translate-y-1 transition-transform"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant">
                <p.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-5 font-display font-semibold text-xl">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UnionPreview() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Union Structure" title="13 wings. One vision." action={{ to: "/wings", label: "View all wings" }} />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {WINGS.slice(0, 8).map((w, i) => (
            <motion.div
              key={w.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to="/wings/$slug"
                params={{ slug: w.slug }}
                className="block group glass rounded-2xl p-5 hover:shadow-elegant hover:-translate-y-1 transition-all h-full"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
                    <span className="font-display font-bold text-primary">{w.name.charAt(0)}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="mt-4 font-display font-semibold">{w.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{w.tagline}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Announcements() {
  const { data: live } = useAnnouncements();
  const items = live.slice(0, 4).map((a) => ({
    id: a.id,
    title: a.title,
    wing: a.wing ?? "MADAD",
    description: a.body,
    date: a.created_at,
  }));
  if (items.length === 0) return null;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
              <Radio className="h-3 w-3 animate-pulse" /> Live
            </div>
            <h2 className="mt-2 font-display font-bold text-3xl sm:text-4xl gradient-text">Announcements</h2>
          </div>
          <Link to="/announcements" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {items.map((a, i) => (
            <motion.article
              key={a.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-strong rounded-2xl p-6 flex gap-5 group hover:shadow-elegant transition"
            >
              <div className="shrink-0 w-20 text-center glass rounded-xl p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{new Date(a.date).toLocaleString("en", { month: "short" })}</div>
                <div className="font-display font-bold text-2xl gradient-text">{new Date(a.date).getDate()}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-gold">{a.wing}</div>
                <h3 className="mt-1 font-display font-semibold text-lg group-hover:text-primary transition">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function UpcomingPrograms() {
  const { upcoming } = usePrograms();
  const items = upcoming.slice(0, 3);
  if (items.length === 0) return null;
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="On the Horizon" title="Upcoming programs." action={{ to: "/events", label: "Open events diary" }} />
        <div className="mt-12 grid lg:grid-cols-3 gap-6">
          {items.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden glass-strong rounded-2xl p-7 hover:-translate-y-1 transition-transform"
            >
              <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-gold opacity-20 blur-2xl" />
              {a.poster_url ? (
                <img loading="lazy" decoding="async" src={a.poster_url} alt="" className="h-32 w-full object-cover rounded-xl mb-3" />
              ) : (
                <Calendar className="h-6 w-6 text-gold" />
              )}
              <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">{WINGS.find(w => w.slug === a.wing)?.name ?? a.wing}</div>
              <h3 className="mt-1 font-display font-semibold text-xl">{a.name}</h3>
              {a.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.description}</p>}
              <div className="mt-5 text-xs text-muted-foreground">
                {new Date(a.event_date).toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: { to: string; label: string } }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="inline-block text-xs font-semibold uppercase tracking-widest text-gold">{eyebrow}</div>
        <h2 className="mt-2 font-display font-bold text-3xl sm:text-4xl gradient-text">{title}</h2>
      </div>
      {action && (
        <Link to={action.to} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
          {action.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export default Home;
