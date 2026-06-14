import { useEffect } from "react";

/**
 * Lightweight per-route document head updater for the SPA.
 * Mirrors what TanStack Start's route `head()` previously did, but as a hook.
 */
export function useDocumentMeta(meta: { title?: string; description?: string } = {}) {
  useEffect(() => {
    if (meta.title) document.title = meta.title;
    if (meta.description) {
      let tag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", meta.description);
    }
  }, [meta.title, meta.description]);
}
