import { useDocumentMeta } from "@/lib/use-document-meta";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Send, ExternalLink } from "lucide-react";
import { YoutubeIcon, InstagramIcon, FacebookIcon } from "@/components/icons/SocialIcons";
import { PageHeader, PageShell } from "@/components/PageShell";
import { submitFeedback } from "@/lib/feedback.functions";

const PHONE = "+91 97450 02987";
const PHONE_TEL = "+919745002987";
const EMAIL = "madad1986@gmail.com";
const ADDRESS = "Darul Huda Islamic University TVM Centre, Thiruvananthapuram, Kerala — 695568, India";
const MAP_QUERY = encodeURIComponent("Darul Huda Islamic University TVM Centre, Thiruvananthapuram, Kerala 695568, India");

const SOCIALS = [
  { Icon: YoutubeIcon, label: "DH MADAD Media (YouTube)", href: "https://www.youtube.com/@dhmadadmedia" },
  { Icon: InstagramIcon, label: "MADAD (Instagram)", href: "https://instagram.com/_madad_dhiu" },
  { Icon: YoutubeIcon, label: "Chintha Podcast (YouTube)", href: "https://www.youtube.com/channel/UCKdFpOOR2mMvg1nvBrZAyuA" },
  { Icon: InstagramIcon, label: "Chintha Podcast (Instagram)", href: "https://instagram.com/chinthapodcast" },
  { Icon: FacebookIcon, label: "Facebook", href: "https://facebook.com/share/1H5J9zM6vM" },
];


function Contact() {
  useDocumentMeta({ title: 'Contact — MADAD', description: 'Reach out to MADAD — Darul Huda Islamic University TVM Centre, Thiruvananthapuram.' });

  const submit = submitFeedback;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email"); return;
    }
    if (!subject.trim()) { toast.error("Please enter a subject"); return; }
    if (!message.trim()) { toast.error("Please write a message"); return; }

    setBusy(true);
    try {
      const body = `Subject: ${subject.trim()}\n\n${message.trim()}\n\n— Sent ${new Date().toLocaleString()}`;
      await submit({
        data: { name: name.trim(), email: email.trim(), rating: null, message: body },
      });
      toast.success("Message sent — we'll get back to you soon");
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch (err) {
      toast.error((err as Error).message || "Failed to send message. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Get in touch"
        title="Contact MADAD."
        description="We'd love to hear from you. Send us a message and we'll respond within two working days."
      />
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-[1fr_1.2fr] gap-8">
          <div className="space-y-4">
            <ContactCard icon={MapPin} title="Visit us">
              <span>{ADDRESS}</span>
            </ContactCard>
            <ContactCard icon={Mail} title="Email">
              <a href={`mailto:${EMAIL}`} className="hover:text-primary break-all">{EMAIL}</a>
            </ContactCard>
            <ContactCard icon={Phone} title="Phone">
              <a href={`tel:${PHONE_TEL}`} className="hover:text-primary">{PHONE}</a>
            </ContactCard>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-strong rounded-2xl p-6"
            >
              <div className="text-xs uppercase tracking-widest text-gold font-semibold">Follow us</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {SOCIALS.map((s) => (
                  <a
                    key={`${s.label}-${s.href}`}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="h-10 w-10 rounded-xl glass border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition"
                  >
                    <s.Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">
                External links open in a new tab.
              </div>
            </motion.div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={onSubmit}
            className="glass-strong rounded-3xl p-8 shadow-elegant space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={120} />
              <Field label="Email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={200} />
            </div>
            <Field label="Subject" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" maxLength={200} />
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Message <span className="text-destructive normal-case">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                maxLength={3500}
                className="mt-2 w-full px-4 py-3 rounded-xl glass border border-border focus:border-primary outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant hover:shadow-gold transition disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send message"} <Send className="h-4 w-4" />
            </button>
            <p className="text-[11px] text-muted-foreground text-center">
              Your message is delivered securely to the MADAD admin team.
            </p>
          </motion.form>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-widest text-gold font-semibold">Find us</div>
              <h2 className="font-display text-2xl font-bold mt-1">Our location</h2>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-gold transition"
            >
              Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="glass-strong rounded-3xl overflow-hidden border border-border shadow-elegant">
            <iframe
              title="MADAD location map"
              src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-[360px] sm:h-[440px] block border-0"
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function ContactCard({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="glass-strong rounded-2xl p-6 flex items-start gap-4"
    >
      <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-widest text-gold font-semibold">{title}</div>
        <div className="mt-1 font-medium break-words">{children}</div>
      </div>
    </motion.div>
  );
}

function Field({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label} {required && <span className="text-destructive normal-case">*</span>}
      </label>
      <input {...props} className="mt-2 w-full h-12 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
    </div>
  );
}

export default Contact;
