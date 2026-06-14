import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { isVideoUrl } from "@/lib/media-utils";
import type { GalleryPhoto } from "@/hooks/use-gallery";

type Props = {
  items: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

export function MediaLightbox({ items, index, onClose, onIndexChange }: Props) {
  const current = items[index];
  const touchStartX = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const goPrev = useCallback(() => {
    if (items.length === 0) return;
    onIndexChange((index - 1 + items.length) % items.length);
  }, [index, items.length, onIndexChange]);

  const goNext = useCallback(() => {
    if (items.length === 0) return;
    onIndexChange((index + 1) % items.length);
  }, [index, items.length, onIndexChange]);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goPrev, goNext]);

  if (!current || !mounted) return null;

  const isVideo = isVideoUrl(current.image_url);
  const dateLabel = formatDate(current.created_at);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    const dx = end - start;
    if (Math.abs(dx) < 40) return;
    if (dx > 0) goPrev();
    else goNext();
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.caption || "Media viewer"}
      className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-xl animate-in fade-in duration-150"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-xs text-muted-foreground">
          {index + 1} / {items.length}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="h-10 w-10 rounded-full glass-strong border border-border inline-flex items-center justify-center hover:bg-primary/10 transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Stage */}
      <div className="relative flex-1 flex items-center justify-center px-2 sm:px-12 min-h-0" onClick={(e) => e.stopPropagation()}>
        {items.length > 1 && (
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="hidden sm:inline-flex absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full glass-strong border border-border items-center justify-center hover:bg-primary/10 transition"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div className="max-h-full max-w-full flex items-center justify-center">
          {isVideo ? (
            <video
              key={current.id}
              src={current.image_url}
              controls
              autoPlay
              playsInline
              className="max-h-[75vh] max-w-full rounded-2xl shadow-elegant bg-black"
            />
          ) : (
            <img
              key={current.id}
              src={current.image_url}
              alt={current.caption || ""}
              decoding="async"
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-elegant"
            />
          )}
        </div>

        {items.length > 1 && (
          <button
            onClick={goNext}
            aria-label="Next"
            className="hidden sm:inline-flex absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full glass-strong border border-border items-center justify-center hover:bg-primary/10 transition"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Caption / meta */}
      <div className="px-4 sm:px-8 py-4 sm:py-6" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto max-w-3xl glass-strong rounded-2xl px-5 py-4 border border-border">
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-gold">
            <span>{current.category || "Uncategorised"}</span>
            {current.event_year && <span>· {current.event_year}</span>}
            {dateLabel && <span className="text-muted-foreground normal-case tracking-normal">· {dateLabel}</span>}
          </div>
          {current.caption && (
            <h3 className="font-display text-base sm:text-lg font-semibold mt-1">{current.caption}</h3>
          )}
        </div>

        {/* Mobile prev/next */}
        {items.length > 1 && (
          <div className="sm:hidden mt-3 flex items-center justify-center gap-3">
            <button
              onClick={goPrev}
              aria-label="Previous"
              className="h-10 w-10 rounded-full glass-strong border border-border inline-flex items-center justify-center"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              aria-label="Next"
              className="h-10 w-10 rounded-full glass-strong border border-border inline-flex items-center justify-center"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
