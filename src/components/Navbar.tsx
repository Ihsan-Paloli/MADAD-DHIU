import { Link, useLocation } from "react-router-dom";import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Menu, Moon, Sun, X, LogIn, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { NotificationBell } from "./NotificationBell";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

type Leaf = { to: string; label: string };
type Item = Leaf | { label: string; children: Leaf[] };

const NAV: Item[] = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/committee", label: "Committee" },
  { to: "/wings", label: "Wings" },
  {
    label: "Activities",
    children: [
      { to: "/events", label: "Events Diary" },
      { to: "/gallery", label: "Gallery" },
      { to: "/announcements", label: "Announcements" },
      { to: "/achievements", label: "Achievements" },
    ],
  },
  {
    label: "Resources",
    children: [
      { to: "/stationery", label: "Stationery" },
      { to: "/analytics", label: "Analytics" },
      { to: "/quick-links", label: "Quick Links" },
      { to: "/feedback", label: "Feedback" },
    ],
  },
  {
    label: "Portals",
    children: [
      { to: "/admin", label: "Admin Portal" },
      { to: "/events-portal", label: "Events Portal" },
      { to: "/auditing", label: "Auditing Portal" },
    ],
  },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { scrollY } = useScroll();
  const pathname = useLocation().pathname;

  useMotionValueEvent(scrollY, "change", (v: number) => setScrolled(v > 20));

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-3 sm:top-5 left-0 right-0 z-50 px-3 sm:px-6"
    >
      <div
        className={cn(
          "mx-auto max-w-7xl rounded-2xl transition-all duration-500",
          scrolled ? "glass-strong shadow-elegant" : "glass",
        )}
      >
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-md opacity-0 group-hover:opacity-40 transition" />
              <Logo className="relative h-10 w-10 sm:h-11 sm:w-11 object-contain" />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display font-bold text-lg gradient-text">MADAD</span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">Darul Huda</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) =>
              "to" in item ? (
                <NavLink key={item.to} to={item.to} label={item.label} pathname={pathname} />
              ) : (
                <DropdownMenu key={item.label} label={item.label} children={item.children} pathname={pathname} />
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="h-10 w-10 rounded-xl glass flex items-center justify-center hover:scale-105 transition-transform"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-gold" /> : <Moon className="h-4 w-4 text-primary" />}
            </button>
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-elegant hover:shadow-gold transition-all hover:-translate-y-0.5"
            >
              <LogIn className="h-4 w-4" /> Login
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className="lg:hidden h-10 w-10 rounded-xl glass flex items-center justify-center"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden px-4 pb-4 flex flex-col gap-1 overflow-hidden"
            >
              {NAV.map((item) =>
                "to" in item ? (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-3 py-2.5 rounded-lg text-sm font-medium transition",
                      pathname === item.to ? "bg-primary/10 text-primary" : "hover:bg-muted",
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div key={item.label} className="pt-2">
                    <div className="px-3 text-[10px] uppercase tracking-widest text-gold font-semibold">{item.label}</div>
                    {item.children.map((c) => (
                      <Link
                        key={c.to}
                        to={c.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "block px-3 py-2 rounded-lg text-sm font-medium transition",
                          pathname === c.to ? "bg-primary/10 text-primary" : "hover:bg-muted",
                        )}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ),
              )}
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-gradient-primary text-primary-foreground text-center"
              >
                Login Portal
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

function NavLink({ to, label, pathname }: { to: string; label: string; pathname: string }) {
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={cn(
        "relative px-3 py-2 text-sm font-medium rounded-lg transition-colors",
        active ? "text-primary" : "text-foreground/70 hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 bg-primary/10 rounded-lg"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative">{label}</span>
    </Link>
  );
}

function DropdownMenu({ label, children, pathname }: { label: string; children: { to: string; label: string }[]; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = children.some((c) => c.to === pathname);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative px-3 py-2 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1",
          active ? "text-primary" : "text-foreground/70 hover:text-foreground",
        )}
      >
        {active && (
          <motion.span
            layoutId="nav-active"
            className="absolute inset-0 bg-primary/10 rounded-lg"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <span className="relative">{label}</span>
        <ChevronDown className={cn("relative h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full pt-2 min-w-[200px]"
          >
            <div className="glass-strong rounded-xl shadow-elegant border border-border p-1.5">
              {children.map((c) => (
                <Link
                  key={c.to}
                  to={c.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm font-medium transition",
                    pathname === c.to ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted hover:text-foreground",
                  )}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
