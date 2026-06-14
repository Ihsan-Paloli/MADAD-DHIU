import { useDocumentMeta } from "@/lib/use-document-meta";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { usePrograms } from "@/hooks/use-programs";
import { useReports } from "@/hooks/use-stationery";
import { supabase } from "@/integrations/supabase/client";
import { WINGS, CORE_COMMITTEE } from "@/lib/madad-data";

// Analytics taxonomy: exclude Auditory Wing (no longer official) and include
// Core Committee as an administrative analytics category. The official public
// wing count (WINGS) is NOT changed.
const ANALYTICS_ORGS = [
  ...WINGS.filter((w) => w.slug !== "auditory").map((w) => ({ slug: w.slug, name: w.name })),
  { slug: CORE_COMMITTEE.slug, name: CORE_COMMITTEE.name },
];
import { BarChart3, TrendingUp, Calendar, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from "recharts";


type WingOverride = { wing: string; total_programs: number | null; active_members: number | null; notes: string | null };

function useWingOverrides() {
  const [data, setData] = useState<WingOverride[]>([]);
  useEffect(() => {
    let active = true;
    supabase.from("wing_stats_overrides").select("*").then(({ data }: { data: WingOverride[] | null }) => {
      if (active) setData((data as WingOverride[]) ?? []);
    });
    const ch = supabase.channel("wing_stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "wing_stats_overrides" }, () => {
        supabase.from("wing_stats_overrides").select("*").then(({ data }: { data: WingOverride[] | null }) => setData((data as WingOverride[]) ?? []));
      })
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, []);
  return data;
}

function Analytics() {
  useDocumentMeta({ title: 'Public Analytics — MADAD', description: 'Live activity, statistics and reports across MADAD wings.' });

  const { data: allPrograms, upcoming: allUpcoming, past: allPast } = usePrograms();
  const { data: reports } = useReports();
  const overrides = useWingOverrides();

  // Exclude Auditory Wing from every analytics surface.
  const programs = allPrograms.filter((p) => p.wing !== "auditory");
  const upcoming = allUpcoming.filter((p) => p.wing !== "auditory");
  const past = allPast.filter((p) => p.wing !== "auditory");

  // Programs per analytics org (live + override). Excludes Auditory Wing,
  // includes Core Committee.
  const perWing = ANALYTICS_ORGS.map((w) => {
    const live = programs.filter((p) => p.wing === w.slug).length;
    const override = overrides.find((o) => o.wing === w.slug)?.total_programs;
    return { slug: w.slug, wing: w.name.replace(/ Wing$/, ""), count: override ?? live };
  });

  const mostActive = [...perWing].sort((a, b) => b.count - a.count)[0];

  // Monthly activity (also excludes Auditory)
  const months: Record<string, number> = {};
  programs.forEach((p) => {
    const m = new Date(p.event_date).toLocaleString("en", { month: "short", year: "2-digit" });
    months[m] = (months[m] ?? 0) + 1;
  });
  const monthly = Object.entries(months).map(([month, count]) => ({ month, count }));

  return (
    <PageShell>
      <PageHeader eyebrow="Public Analytics" title="MADAD by the numbers." description="Live programs, wing activity and reports — open for everyone to see." />

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6 space-y-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Calendar />} label="Total programs" value={programs.length} />
            <StatCard icon={<TrendingUp />} label="Upcoming" value={upcoming.length} />
            <StatCard icon={<Award />} label="Completed" value={past.length} />
            <StatCard icon={<BarChart3 />} label="Reports" value={reports.length} />
          </div>

          {mostActive && mostActive.count > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-strong rounded-3xl p-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-gold">Most active wing</div>
                <h3 className="font-display text-3xl font-bold mt-1 gradient-text">{mostActive.wing}</h3>
              </div>
              <div className="text-right">
                <div className="font-display text-4xl font-bold"><AnimatedCounter value={mostActive.count} /></div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">programs</div>
              </div>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-strong rounded-3xl p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Programs per wing</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={perWing}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="wing" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={70} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-strong rounded-3xl p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Monthly activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {reports.length > 0 && (
            <div>
              <h3 className="font-display text-xl font-bold mb-4">Latest reports</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.slice(0, 6).map((r) => (
                  <a key={r.id} href={r.file_url ?? "#"} target="_blank" rel="noopener" className="glass-strong rounded-2xl p-5 hover:-translate-y-0.5 transition">
                    <div className="text-[10px] uppercase text-gold">{new Date(r.created_at).toLocaleDateString()}</div>
                    <h4 className="font-display font-semibold mt-1">{r.title}</h4>
                    {r.body && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.body}</p>}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-strong rounded-2xl p-5">
      <div className="text-primary">{icon}</div>
      <div className="font-display font-bold text-3xl mt-3 gradient-text"><AnimatedCounter value={value} /></div>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
}

export default Analytics;
