import { useCallback, useEffect, useMemo, useState } from "react";
import { useAnnouncements } from "@/hooks/use-announcements";
import { usePrograms } from "@/hooks/use-programs";
import { useGallery } from "@/hooks/use-gallery";
import { useAchievements } from "@/hooks/use-achievements";
import { useQuickLinks } from "@/hooks/use-quick-links";
import { resolveOrgName, CORE_COMMITTEE } from "@/lib/madad-data";

export type NotificationCategory =
  | "event_added"
  | "event_updated"
  | "event_cancelled"
  | "result_published"
  | "result_updated"
  | "gallery_added"
  | "gallery_updated"
  | "achievement_added"
  | "achievement_updated"
  | "quicklink_added"
  | "quicklink_updated"
  | "announcement_important"
  | "announcement_core";

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  at: string;
  refId?: string;
  to?: string;
  params?: Record<string, string>;
};

export type NotificationSettings = {
  retentionDays: number;
  autoCleanup: boolean;
  disabled: NotificationCategory[];
};

const READ_KEY = "madad:notif:read";
const CLEARED_KEY = "madad:notif:cleared";
const SETTINGS_KEY = "madad:notif:settings";

const DEFAULT_SETTINGS: NotificationSettings = {
  retentionDays: 30,
  autoCleanup: true,
  disabled: [],
};

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  event_added: "New events",
  event_updated: "Event updates",
  event_cancelled: "Event cancellations",
  result_published: "New results",
  result_updated: "Result updates",
  gallery_added: "Gallery additions",
  gallery_updated: "Gallery updates",
  achievement_added: "New achievements",
  achievement_updated: "Achievement updates",
  quicklink_added: "New quick links",
  quicklink_updated: "Quick link updates",
  announcement_important: "Important announcements",
  announcement_core: "Core committee announcements",
};

function loadSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

function loadSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: NotificationSettings) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

function isCoreAnnouncement(wing: string | null | undefined) {
  if (!wing) return false;
  const w = wing.toLowerCase().trim();
  return w === CORE_COMMITTEE.slug || w === CORE_COMMITTEE.name.toLowerCase();
}

// An item is "updated" if updated_at is meaningfully later than created_at.
function wasUpdated(created?: string | null, updated?: string | null) {
  if (!created || !updated) return false;
  return +new Date(updated) - +new Date(created) > 60_000; // > 1 minute
}

export function useNotifications() {
  const { data: announcements, loading: lA } = useAnnouncements() as { data: any[]; loading: boolean };
  const { data: programs, loading: lP } = usePrograms() as { data: any[]; loading: boolean };
  const { data: gallery, loading: lG } = useGallery() as { data: any[]; loading: boolean };
  const { data: achievements, loading: lAc } = useAchievements() as { data: any[]; loading: boolean };
  const { data: quickLinks, loading: lQ } = useQuickLinks() as { data: any[]; loading: boolean };

  const allLoaded = !lA && !lP && !lG && !lAc && !lQ;

  const [readIds, setReadIds] = useState<Set<string>>(() => loadSet(READ_KEY));
  const [clearedIds, setClearedIds] = useState<Set<string>>(() => loadSet(CLEARED_KEY));
  const [settings, setSettingsState] = useState<NotificationSettings>(() => loadSettings());

  // Persist read & cleared state across tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === READ_KEY) setReadIds(loadSet(READ_KEY));
      if (e.key === CLEARED_KEY) setClearedIds(loadSet(CLEARED_KEY));
      if (e.key === SETTINGS_KEY) setSettingsState(loadSettings());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const all = useMemo<AppNotification[]>(() => {
    const out: AppNotification[] = [];

    // Announcements
    for (const a of announcements) {
      const core = isCoreAnnouncement(a.wing);
      out.push({
        id: `announcement:${core ? "core" : "imp"}:${a.id}`,
        category: core ? "announcement_core" : "announcement_important",
        title: core ? `Core Committee: ${a.title}` : a.title,
        description: a.body?.slice(0, 160) ?? "",
        at: a.created_at,
        refId: a.id,
        to: "/announcements",
      });
    }

    // Programs → event added / updated / cancelled / result published / updated
    for (const p of programs) {
      const wingName = resolveOrgName(p.wing);
      const baseSub = `${new Date(p.event_date).toLocaleDateString()} · ${wingName}`;

      if (p.archived_at) {
        out.push({
          id: `program:cancelled:${p.id}`,
          category: "event_cancelled",
          title: `Event cancelled: ${p.name}`,
          description: baseSub,
          at: p.archived_at,
          refId: p.id,
          to: "/events",
        });
      } else {
        // Added
        out.push({
          id: `program:added:${p.id}`,
          category: "event_added",
          title: `New event: ${p.name}`,
          description: baseSub,
          at: p.created_at ?? p.event_date,
          refId: p.id,
          to: "/events",
        });
        // Updated
        if (wasUpdated(p.created_at, p.updated_at)) {
          out.push({
            id: `program:updated:${p.id}:${p.updated_at}`,
            category: "event_updated",
            title: `Event updated: ${p.name}`,
            description: baseSub,
            at: p.updated_at,
            refId: p.id,
            to: "/events",
          });
        }
      }

      // Result published
      if (p.result_status === "published") {
        out.push({
          id: `result:published:${p.id}`,
          category: "result_published",
          title: `New result: ${p.name}`,
          description: wingName,
          at: p.updated_at ?? p.created_at ?? p.event_date,
          refId: p.id,
          to: `/results/${p.id}`,
        });
        if (wasUpdated(p.created_at, p.updated_at)) {
          out.push({
            id: `result:updated:${p.id}:${p.updated_at}`,
            category: "result_updated",
            title: `Result updated: ${p.name}`,
            description: wingName,
            at: p.updated_at,
            refId: p.id,
            to: `/results/${p.id}`,
            
          });
        }
      }
    }

    // Gallery
    for (const g of gallery) {
      out.push({
        id: `gallery:added:${g.id}`,
        category: "gallery_added",
        title: `New gallery photo${g.caption ? `: ${g.caption}` : ""}`,
        description: [g.wing ? resolveOrgName(g.wing) : null, g.category].filter(Boolean).join(" · "),
        at: g.created_at,
        refId: g.id,
        to: "/gallery",
      });
    }

    // Achievements
    for (const a of achievements) {
      out.push({
        id: `achievement:added:${a.id}`,
        category: "achievement_added",
        title: `New achievement: ${a.title}`,
        description: [a.level, a.category].filter(Boolean).join(" · "),
        at: a.created_at,
        refId: a.id,
        to: "/achievements",
      });
      if (wasUpdated(a.created_at, a.updated_at)) {
        out.push({
          id: `achievement:updated:${a.id}:${a.updated_at}`,
          category: "achievement_updated",
          title: `Achievement updated: ${a.title}`,
          description: [a.level, a.category].filter(Boolean).join(" · "),
          at: a.updated_at,
          refId: a.id,
          to: "/achievements",
        });
      }
    }

    // Quick Links
    for (const q of quickLinks) {
      out.push({
        id: `quicklink:added:${q.id}`,
        category: "quicklink_added",
        title: `New quick link: ${q.title}`,
        description: q.description ?? q.url,
        at: q.created_at,
        refId: q.id,
        to: "/quick-links",
      });
      if (wasUpdated(q.created_at, q.updated_at)) {
        out.push({
          id: `quicklink:updated:${q.id}:${q.updated_at}`,
          category: "quicklink_updated",
          title: `Quick link updated: ${q.title}`,
          description: q.description ?? q.url,
          at: q.updated_at,
          refId: q.id,
          to: "/quick-links",
        });
      }
    }

    return out;
  }, [announcements, programs, gallery, achievements, quickLinks]);

  const visible = useMemo<AppNotification[]>(() => {
    const cutoff = settings.autoCleanup
      ? Date.now() - settings.retentionDays * 24 * 60 * 60 * 1000
      : 0;
    const disabledSet = new Set(settings.disabled);
    const seen = new Set<string>();
    return all
      .filter((n) => {
        if (clearedIds.has(n.id)) return false;
        if (disabledSet.has(n.category)) return false;
        const ts = +new Date(n.at);
        if (cutoff && ts < cutoff) return false;
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      })
      .sort((a, b) => +new Date(b.at) - +new Date(a.at));
  }, [all, clearedIds, settings]);

  const unreadCount = useMemo(
    () => visible.reduce((acc, n) => (readIds.has(n.id) ? acc : acc + 1), 0),
    [visible, readIds],
  );

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveSet(READ_KEY, next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      visible.forEach((n) => next.add(n.id));
      saveSet(READ_KEY, next);
      return next;
    });
  }, [visible]);

  const clearOne = useCallback((id: string) => {
    setClearedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSet(CLEARED_KEY, next);
      return next;
    });
  }, []);

  const clearAllRead = useCallback(() => {
    setClearedIds((prev) => {
      const next = new Set(prev);
      visible.forEach((n) => { if (readIds.has(n.id)) next.add(n.id); });
      saveSet(CLEARED_KEY, next);
      return next;
    });
  }, [visible, readIds]);

  const setSettings = useCallback((updater: (prev: NotificationSettings) => NotificationSettings) => {
    setSettingsState((prev) => {
      const next = updater(prev);
      saveSettings(next);
      return next;
    });
  }, []);

  // Auto cleanup: prune cleared/read sets from rows that no longer exist.
  // CRITICAL: only run after every source query has finished loading; otherwise
  // a partially-loaded `all` would prune read IDs for items that simply haven't
  // arrived yet, causing read notifications to flip back to unread on refresh.
  useEffect(() => {
    if (!allLoaded) return;
    if (!all.length) return;
    const liveIds = new Set(all.map((n) => n.id));
    setClearedIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => { if (liveIds.has(id)) next.add(id); });
      if (next.size !== prev.size) saveSet(CLEARED_KEY, next);
      return next.size !== prev.size ? next : prev;
    });
    setReadIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => { if (liveIds.has(id)) next.add(id); });
      if (next.size !== prev.size) saveSet(READ_KEY, next);
      return next.size !== prev.size ? next : prev;
    });
  }, [all, allLoaded]);

  return {
    notifications: visible,
    unreadCount,
    readIds,
    markAsRead,
    markAllAsRead,
    clearOne,
    clearAllRead,
    settings,
    setSettings,
  };
}
