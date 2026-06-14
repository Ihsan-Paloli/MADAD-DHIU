import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";import { Lock, ShieldCheck, ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import { verifyPortalPassword, issueAdminToken } from "@/lib/portal-auth.functions";
import { usePortalAuth, type PortalId } from "@/hooks/use-portal-auth";
import { WINGS } from "@/lib/madad-data";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  portal: PortalId;
  title: string;
  eyebrow: string;
  description: string;
  requireWing?: boolean;
  children: (signOut: () => void) => React.ReactNode;
};

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoFocus,
  label,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  label: string;
  id: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 px-4 pr-12 rounded-xl glass border border-border focus:border-primary outline-none"
          placeholder={placeholder ?? "••••••••"}
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 px-3 inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function PortalGate({ portal, title, eyebrow, description, requireWing, children }: Props) {
  const { token, ready, signIn, signOut } = usePortalAuth(portal);
  const verify = verifyPortalPassword;
  const issueAdmin = issueAdminToken;
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [wing, setWing] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmitPortal(e: React.FormEvent) {
    e.preventDefault();
    if (requireWing && !wing) {
      toast.error("Select your wing");
      return;
    }
    setBusy(true);
    try {
      const res = await verify({
        data: { portal: portal as "events" | "auditing", password, wing: requireWing ? wing : null },
      });
      if (!res.ok) {
        toast.error(res.error ?? "Access denied");
        return;
      }
      signIn(res.token);
      toast.success(`Welcome to the ${title}`);
      setPassword("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onSubmitAdmin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr) {
        toast.error(signErr.message);
        return;
      }
      // Now ask the server for an admin portal token (verifies role=admin).
      try {
        const res = await issueAdmin();
        signIn(res.token);
        toast.success(`Welcome to the ${title}`);
        setPassword("");
      } catch (err) {
        await supabase.auth.signOut();
        toast.error((err as Error).message || "Access denied");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onSignOut() {
    signOut();
    if (portal === "admin") {
      try { await supabase.auth.signOut(); } catch {}
    }
  }

  if (!ready) {
    return <div className="glass-strong rounded-2xl p-10 text-center text-muted-foreground max-w-md mx-auto">Loading…</div>;
  }

  if (!token) {
    const isAdmin = portal === "admin";
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto glass-strong rounded-3xl p-8 shadow-elegant">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> All portals
        </Link>
        <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-widest">
          <ShieldCheck className="h-4 w-4" /> {eyebrow}
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <form onSubmit={isAdmin ? onSubmitAdmin : onSubmitPortal} className="mt-6 space-y-4">
          {isAdmin && (
            <div>
              <label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Admin email</label>
              <input
                id="admin-email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full h-12 px-4 rounded-xl glass border border-border focus:border-primary outline-none"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          )}
          {!isAdmin && requireWing && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your wing</label>
              <select
                required
                value={wing}
                onChange={(e) => setWing(e.target.value)}
                className="mt-2 w-full h-12 px-4 rounded-xl glass border border-border focus:border-primary outline-none"
              >
                <option value="">Select wing…</option>
                {WINGS.map((w) => (
                  <option key={w.slug} value={w.slug}>{w.name}</option>
                ))}
              </select>
            </div>
          )}
          <PasswordInput
            id="portal-password"
            label={isAdmin ? "Admin password" : "Portal password"}
            value={password}
            onChange={setPassword}
            autoFocus={!isAdmin && !requireWing}
          />
          <button disabled={busy} className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 shadow-elegant hover:shadow-gold transition disabled:opacity-50">
            {isAdmin ? <LogIn className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {busy ? "Verifying…" : isAdmin ? "Sign in" : "Enter portal"}
          </button>
        </form>
        <p className="mt-6 text-[11px] text-center text-muted-foreground">
          {isAdmin
            ? "Admin access is granted by role. Contact a MADAD admin to be added."
            : "Need the password? Contact the MADAD admin team."}
        </p>
      </motion.div>
    );
  }

  return <>{children(onSignOut)}</>;
}
