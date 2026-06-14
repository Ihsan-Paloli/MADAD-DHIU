import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Megaphone,
  Trophy,
  CalendarPlus,
  CalendarX,
  CalendarClock,
  Image as ImageIcon,
  Award,
  Link2,
  ShieldAlert,
  Check,
  CheckCheck,
  X,
  Settings,
  Trash2,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  useNotifications,
  type AppNotification,
  type NotificationCategory,
} from "@/hooks/use-notifications";

const ICON_MAP: Record<NotificationCategory, { Icon: React.ComponentType<{ className?: string }>; accent: string }> = {
  event_added: { Icon: CalendarPlus, accent: "text-emerald-500" },
  event_updated: { Icon: CalendarClock, accent: "text-amber-500" },
  event_cancelled: { Icon: CalendarX, accent: "text-rose-500" },
  result_published: { Icon: Trophy, accent: "text-gold" },
  result_updated: { Icon: Trophy, accent: "text-amber-500" },
  gallery_added: { Icon: ImageIcon, accent: "text-sky-500" },
  gallery_updated: { Icon: ImageIcon, accent: "text-amber-500" },
  achievement_added: { Icon: Award, accent: "text-gold" },
  achievement_updated: { Icon: Award, accent: "text-amber-500" },
  quicklink_added: { Icon: Link2, accent: "text-violet-500" },
  quicklink_updated: { Icon: Link2, accent: "text-amber-500" },
  announcement_important: { Icon: Megaphone, accent: "text-primary" },
  announcement_core: { Icon: ShieldAlert, accent: "text-rose-500" },
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    readIds,
    markAsRead,
    markAllAsRead,
    clearOne,
    clearAllRead,
    settings,
    setSettings,
  } = useNotifications();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
        setShowSettings(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const displayed = notifications.slice(0, 30);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative h-10 w-10 rounded-xl glass flex items-center justify-center hover:scale-105 transition-transform"
      >
        <Bell className="h-4 w-4 text-primary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-gradient-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-elegant">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{ maxWidth: "calc(100vw - 1rem)" }}
            className="fixed left-2 right-2 mt-2 w-auto sm:absolute sm:left-auto sm:right-0 sm:w-[22rem] max-h-[75vh] overflow-hidden glass-strong rounded-2xl shadow-elegant border border-border z-50 flex flex-col"
          >
            <div className="p-3 border-b border-border flex items-center justify-between gap-2">
              <div className="font-display font-semibold text-sm">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-[10px] uppercase tracking-widest text-primary">{unreadCount} new</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  disabled={unreadCount === 0}
                  className="h-7 w-7 rounded-md hover:bg-primary/10 flex items-center justify-center text-muted-foreground disabled:opacity-40"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={clearAllRead}
                  title="Clear read notifications"
                  className="h-7 w-7 rounded-md hover:bg-primary/10 flex items-center justify-center text-muted-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setShowSettings((v) => !v)}
                  title="Notification settings"
                  className={`h-7 w-7 rounded-md hover:bg-primary/10 flex items-center justify-center ${showSettings ? "text-primary" : "text-muted-foreground"}`}
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {showSettings ? (
              <div className="p-4 overflow-auto text-xs space-y-4">
                <div>
                  <label className="font-semibold uppercase tracking-widest text-[10px] text-muted-foreground">
                    Retention (days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={settings.retentionDays}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, retentionDays: Math.max(1, Math.min(365, Number(e.target.value) || 30)) }))
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-transparent px-2 py-1.5 text-xs"
                  />
                </div>
                <label className="flex items-center justify-between gap-2">
                  <span className="font-semibold uppercase tracking-widest text-[10px] text-muted-foreground">
                    Auto cleanup
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.autoCleanup}
                    onChange={(e) => setSettings((s) => ({ ...s, autoCleanup: e.target.checked }))}
                  />
                </label>
                <div>
                  <div className="font-semibold uppercase tracking-widest text-[10px] text-muted-foreground mb-1.5">
                    Categories
                  </div>
                  <div className="space-y-1 max-h-56 overflow-auto pr-1">
                    {(Object.keys(CATEGORY_LABELS) as NotificationCategory[]).map((cat) => {
                      const enabled = !settings.disabled.includes(cat);
                      return (
                        <label key={cat} className="flex items-center justify-between gap-2 py-0.5">
                          <span>{CATEGORY_LABELS[cat]}</span>
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) =>
                              setSettings((s) => ({
                                ...s,
                                disabled: e.target.checked
                                  ? s.disabled.filter((c) => c !== cat)
                                  : [...s.disabled, cat],
                              }))
                            }
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : displayed.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No notifications.</div>
            ) : (
              <ul className="divide-y divide-border overflow-auto">
                {displayed.map((n) => (
                  <NotificationItem
                    key={n.id}
                    n={n}
                    isRead={readIds.has(n.id)}
                    onRead={() => markAsRead(n.id)}
                    onClear={() => clearOne(n.id)}
                    onNavigate={() => { markAsRead(n.id); setOpen(false); }}
                  />
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({
  n,
  isRead,
  onRead,
  onClear,
  onNavigate,
}: {
  n: AppNotification;
  isRead: boolean;
  onRead: () => void;
  onClear: () => void;
  onNavigate: () => void;
}) {
  const { Icon, accent } = ICON_MAP[n.category];

  const body = (
    <div className={`p-3 flex gap-3 transition cursor-pointer ${isRead ? "opacity-70" : "bg-primary/5"} hover:bg-primary/10`}>
      <div className={`relative h-9 w-9 rounded-lg glass flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="h-4 w-4" />
        {!isRead && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-sm break-words pr-8 ${isRead ? "font-normal" : "font-semibold"}`}>{n.title}</div>
        {n.description && (
          <div className="text-[11px] text-muted-foreground break-words pr-8">{n.description}</div>
        )}
        <div className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(n.at)}</div>
      </div>
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition" />
    </div>
  );

  return (
    <li className="group relative">
      {n.to ? (
        n.params ? (
          <Link
              to={n.to}
              onClick={onNavigate}
            >
              {body}
            </Link>
        ) : (
          <Link to={n.to as "/announcements"} onClick={onNavigate}>{body}</Link>
        )
      ) : (
        <button type="button" onClick={onNavigate} className="block w-full text-left">{body}</button>
      )}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        {!isRead && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRead(); }}
            title="Mark as read"
            className="h-6 w-6 rounded-md bg-background/80 hover:bg-primary/20 flex items-center justify-center"
          >
            <Check className="h-3 w-3" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClear(); }}
          title="Clear"
          className="h-6 w-6 rounded-md bg-background/80 hover:bg-rose-500/20 flex items-center justify-center"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </li>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - +new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
