import { useDocumentMeta } from "@/lib/use-document-meta";
import { motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";
import { Award, BookOpen, Compass, Flag, History, Target } from "lucide-react";


function About() {
  useDocumentMeta({ title: 'About MADAD — Darul Huda', description: 'History, vision, mission, objectives and achievements of MADAD at Darul Huda Islamic University.' });

  const blocks = [
    { icon: History, title: "Our History", body: "Founded as the central student union of Darul Huda Islamic University, MADAD has grown into a thirteen-wing institutional body coordinating academic, cultural, literary, athletic and welfare activities." },
    { icon: Compass, title: "Our Vision", body: "To cultivate a generation of confident, articulate and ethical scholars whose leadership uplifts communities and contributes meaningfully to society." },
    { icon: Target, title: "Our Mission", body: "Provide platforms for student expression, develop leadership through participatory governance, and coordinate creative, scholarly and humanitarian programs." },
    { icon: Flag, title: "Objectives", body: "Coordinate all wings, organize co-curricular programs, manage events calendars, publish institutional reports and serve as the official voice of the student body." },
    { icon: Award, title: "Achievements", body: "Over 500 programs conducted, recognized inter-collegiate participation, published periodicals across multiple languages, and active community outreach." },
    { icon: BookOpen, title: "Structure", body: "A Core Committee, an independent Auditing Wing, and thirteen specialized wings, each led by a Chairman and two Convenors." },
  ];
  return (
    <PageShell>
      <PageHeader eyebrow="About MADAD" title="A heritage of scholarship." description="MADAD — Medium for Associative and Directive Activities of Darul Huda — is the central student union representing thousands of scholars across thirteen specialized wings." />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blocks.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-strong rounded-2xl p-7 hover:-translate-y-1 transition"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant">
                <b.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="mt-5 font-display font-semibold text-xl">{b.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export default About;
