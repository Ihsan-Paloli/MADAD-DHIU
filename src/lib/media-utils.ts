// Utilities for detecting media type from a URL or filename.
// Used by the gallery to support both images and videos without any
// database schema changes (the media type is inferred from the URL).

const VIDEO_RE = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;
const IMAGE_RE = /\.(png|jpe?g|gif|webp|avif|svg|bmp)(\?|#|$)/i;

export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return VIDEO_RE.test(url);
}

export function isImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (isVideoUrl(url)) return false;
  // Default to image if it matches known image extensions, or if it doesn't
  // match any known video extension (most legacy gallery entries are images).
  return IMAGE_RE.test(url) || !VIDEO_RE.test(url);
}

export function mediaKind(url: string | null | undefined): "image" | "video" | "unknown" {
  if (!url) return "unknown";
  if (isVideoUrl(url)) return "video";
  if (IMAGE_RE.test(url)) return "image";
  return "image";
}
