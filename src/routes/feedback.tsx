import { useDocumentMeta } from "@/lib/use-document-meta";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Star, Send, MessageSquare } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { submitFeedback } from "@/lib/feedback.functions";


function FeedbackPage() {
  useDocumentMeta({ title: 'Feedback — MADAD', description: 'Share your feedback about the MADAD website. Your input helps us improve.' });

  const submit = submitFeedback;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { toast.error("Email is required"); return; }
    if (!message.trim()) { toast.error("Please write a message"); return; }
    setBusy(true);
    try {
      await submit({ data: { name: name || null, email, rating: rating || null, message } });
      toast.success("Thank you — feedback received");
      setSent(true);
      setName(""); setEmail(""); setRating(0); setMessage("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <PageShell>
      <PageHeader eyebrow="We're listening" title="Share your feedback." description="Tell us how we can make MADAD better. Your message reaches the admin team directly." />
      <section className="py-12">
        <div className="mx-auto max-w-2xl px-6">
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={onSubmit}
            className="glass-strong rounded-3xl p-8 shadow-elegant space-y-5"
          >
            <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-widest">
              <MessageSquare className="h-4 w-4" /> Website feedback
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Name <span className="opacity-60 normal-case">(optional)</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-2 w-full h-12 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email <span className="text-destructive normal-case">*</span></label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 w-full h-12 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Rating</label>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    aria-label={`Rate ${n} stars`}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star className={`h-7 w-7 transition ${(hover || rating) >= n ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                  </button>
                ))}
                {rating > 0 && <span className="ml-2 text-xs text-muted-foreground">{rating}/5</span>}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Feedback message <span className="text-destructive normal-case">*</span></label>
              <textarea required rows={5} maxLength={4000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What's on your mind?" className="mt-2 w-full px-4 py-3 rounded-xl glass border border-border focus:border-primary outline-none resize-none" />
            </div>

            <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant hover:shadow-gold transition disabled:opacity-50">
              {busy ? "Sending…" : sent ? "Send another" : "Send feedback"} <Send className="h-4 w-4" />
            </button>
            <p className="text-[11px] text-muted-foreground text-center">Your feedback is private and visible only to the admin team.</p>
          </motion.form>
        </div>
      </section>
    </PageShell>
  );
}

export default FeedbackPage;
