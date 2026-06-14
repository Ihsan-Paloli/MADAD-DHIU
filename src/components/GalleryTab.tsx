import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Image as ImageIcon, Play } from "lucide-react";
import { FileUploadField } from "@/components/ProgramForm";
import { useGallery } from "@/hooks/use-gallery";
import { createGalleryPhoto, deleteGalleryPhoto } from "@/lib/gallery.functions";
import { WINGS } from "@/lib/madad-data";
import { isVideoUrl } from "@/lib/media-utils";

const CATEGORIES = ["Events", "Wings", "Cultural", "Sports", "Academic"] as const;

export function GalleryTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const { data, loading } = useGallery();
  const create = createGalleryPhoto;
  const remove = deleteGalleryPhoto;

  const [showForm, setShowForm] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<string>("Events");
  const [wing, setWing] = useState<string>("");
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));
  const [busy, setBusy] = useState(false);

  function reset() {
    setImage(null); setCaption(""); setCategory("Events");
    setWing(""); setYear(String(new Date().getFullYear()));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!image) { toast.error("Upload a photo first"); return; }
    setBusy(true);
    try {
      await create({ data: {
        token,
        image_url: image,
        caption: caption || null,
        category,
        wing: wing || null,
        event_year: Number(year) || new Date().getFullYear(),
      }});
      qc.invalidateQueries({ queryKey: ["gallery_photos"] });
      toast.success("Photo added");
      reset(); setShowForm(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    try {
      await remove({ data: { token, id } });
      qc.invalidateQueries({ queryKey: ["gallery_photos"] });
      toast.success("Photo deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Gallery ({data.length})</h2>
        <button onClick={() => { if (showForm) reset(); setShowForm(!showForm); }} className="h-10 px-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-2 shadow-elegant">
          <Plus className="h-4 w-4" /> {showForm ? "Close" : "Add media"}
        </button>
      </div>
      {showForm && (
        <form onSubmit={submit} className="glass-strong rounded-3xl p-6 space-y-4">
          <FileUploadField label="Photo or video" bucket="gallery" token={token} value={image} onChange={setImage} accept="image/*,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" />
          <p className="-mt-2 text-[11px] text-muted-foreground">Images up to 5MB · Videos up to 10MB (MP4, WEBM, MOV)</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Caption</label>
              <input maxLength={500} value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" placeholder="Optional caption" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Wing (optional)</label>
              <select value={wing} onChange={(e) => setWing(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none">
                <option value="">— None —</option>
                {WINGS.map(w => <option key={w.slug} value={w.slug}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Year</label>
              <input type="number" min="1900" max="2999" value={year} onChange={(e) => setYear(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none" />
            </div>
          </div>
          <button disabled={busy} className="h-11 px-6 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant disabled:opacity-50">{busy ? "Adding…" : "Add to gallery"}</button>
        </form>
      )}

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {!loading && data.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">No media yet. Upload the first one above.</div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.map((p) => {
          const video = isVideoUrl(p.image_url);
          return (
          <div key={p.id} className="glass-strong rounded-2xl overflow-hidden group relative">
            <div className="aspect-square bg-muted relative">
              {p.image_url ? (
                video ? (
                  <>
                    <video src={p.image_url} muted playsInline preload="metadata" className="h-full w-full object-cover bg-black" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="h-10 w-10 rounded-full bg-background/70 backdrop-blur inline-flex items-center justify-center">
                        <Play className="h-4 w-4 ml-0.5 text-primary" />
                      </span>
                    </div>
                  </>
                ) : (
                  <img loading="lazy" decoding="async" src={p.image_url} alt={p.caption || ""} className="h-full w-full object-cover" />
                )
              ) : (
                <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
              )}
            </div>
            <div className="p-3">
              <div className="text-[10px] uppercase tracking-widest text-gold">{p.category || "Uncategorised"} · {p.event_year ?? "—"}</div>
              {p.caption && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.caption}</div>}
            </div>
            <button
              onClick={() => onDelete(p.id)}
              className="absolute top-2 right-2 h-8 w-8 rounded-lg bg-background/80 backdrop-blur border border-border text-destructive opacity-0 group-hover:opacity-100 transition inline-flex items-center justify-center"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          );
        })}
      </div>
    </div>
  );
}
