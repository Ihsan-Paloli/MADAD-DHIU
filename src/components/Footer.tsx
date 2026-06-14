import { Link } from "react-router-dom";import { Logo } from "./Logo";
import { Mail, MapPin, Phone, MessageSquare, ExternalLink } from "lucide-react";
import { YoutubeIcon, InstagramIcon, FacebookIcon } from "@/components/icons/SocialIcons";
import { useQuickLinks } from "@/hooks/use-quick-links";

const SOCIALS = [
  { Icon: YoutubeIcon, label: "DH MADAD Media", href: "https://www.youtube.com/@dhmadadmedia" },
  { Icon: InstagramIcon, label: "MADAD", href: "https://instagram.com/_madad_dhiu" },
  { Icon: YoutubeIcon, label: "Chintha Podcast", href: "https://www.youtube.com/channel/UCKdFpOOR2mMvg1nvBrZAyuA" },
  { Icon: InstagramIcon, label: "Chintha Podcast", href: "https://instagram.com/chinthapodcast" },
  { Icon: FacebookIcon, label: "Facebook", href: "https://facebook.com/share/1H5J9zM6vM" },
];

export function Footer() {
  const { data: quickLinks } = useQuickLinks();
  const featured = quickLinks.slice(0, 5);

  return (
    <footer className="relative mt-32 border-t border-border bg-muted/30">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-12" />
            <div>
              <div className="font-display font-bold text-xl gradient-text">MADAD</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Darul Huda Islamic University</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Medium for Associative and Directive Activities of Darul Huda — fostering leadership,
            scholarship and creative expression across thirteen specialized wings.
          </p>
          <Link to="/feedback" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-gold transition">
            <MessageSquare className="h-4 w-4" /> Share feedback
          </Link>

          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2 mt-4">Follow us</div>
            <div className="flex flex-wrap gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={`${s.label}-${s.href}`}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="h-9 w-9 rounded-lg glass border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition"
                >
                  <s.Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {featured.length === 0 && (
              <>
                <li><Link to="/about" className="hover:text-primary">About</Link></li>
                <li><Link to="/wings" className="hover:text-primary">Wings</Link></li>
                <li><Link to="/events" className="hover:text-primary">Events</Link></li>
                <li><Link to="/gallery" className="hover:text-primary">Gallery</Link></li>
              </>
            )}
            {featured.map((l) => (
              <li key={l.id}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary inline-flex items-center gap-1">
                  {l.title} <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
            ))}
            <li><Link to="/quick-links" className="hover:text-primary inline-flex items-center gap-1">View all →</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" />
              <span>Darul Huda Islamic University TVM Centre, Thiruvananthapuram, Kerala — 695568, India</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gold shrink-0" />
              <a href="mailto:madad1986@gmail.com" className="hover:text-primary break-all">madad1986@gmail.com</a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold shrink-0" />
              <a href="tel:+919745002987" className="hover:text-primary">+91 97450 02987</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MADAD — Darul Huda Islamic University. All rights reserved.
      </div>
    </footer>
  );
}
