import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, Loader2, RotateCcw, X, FileText, CheckCircle2 } from "lucide-react";
import { uploadFile } from "@/lib/uploads.functions";
import { WINGS } from "@/lib/madad-data";
import type { Program } from "@/hooks/use-programs";

type Bucket = "posters" | "stationery" | "reports" | "gallery" | "results" | "documents";

// Standard limits (in bytes). Tuned to the project's storage policy.
const IMAGE_MAX = 5 * 1024 * 1024; // 5MB
const PDF_MAX = 10 * 1024 * 1024; // 10MB
const DOC_MAX = 10 * 1024 * 1024; // 10MB
const VIDEO_MAX = 10 * 1024 * 1024; // 10MB (server RPC payload limit)

function validateFile(file: File, accept: string): string | null {
  const lowerName = file.name.toLowerCase();
  const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(lowerName);
  const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v|ogv)$/i.test(lowerName);
  const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");
  const isDoc = /\.(docx?|xlsx?|pptx?|txt|csv)$/i.test(lowerName);

  // Type restriction from accept attribute
  if (accept && accept !== "*") {
    const tokens = accept.split(",").map((s) => s.trim().toLowerCase());
    const ok = tokens.some((t) => {
      if (t.startsWith(".")) return lowerName.endsWith(t);
      if (t.endsWith("/*")) return file.type.startsWith(t.slice(0, -1));
      return file.type === t;
    });
    if (!ok) return `File type not allowed. Accepted: ${accept}`;
  }

  const max = isVideo ? VIDEO_MAX : isImage ? IMAGE_MAX : isPdf ? PDF_MAX : isDoc ? DOC_MAX : IMAGE_MAX;
  if (file.size > max) {
    return `File must be under ${Math.round(max / 1024 / 1024)}MB`;
  }
  return null;
}

export function FileUploadField({
  label,
  bucket,
  token,
  value,
  onChange,
  accept = "image/*",
}: {
  label: string;
  bucket: Bucket;
  token: string;
  value: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
}) {
  const upload = uploadFile;
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);

  async function doUpload(file: File) {
    const validationError = validateFile(file, accept);
    if (validationError) {
      toast.error(validationError);
      setError(validationError);
      return;
    }
    setError(null);
    setSuccess(false);
    setBusy(true);
    setProgress(8);
    // Lightweight pseudo-progress while we serialize + RPC (no streaming on RPC layer)
    const tick = setInterval(() => setProgress((p) => (p < 85 ? p + 4 : p)), 180);
    try {
      const buf = await file.arrayBuffer();
      setProgress(35);
      // Chunked btoa to avoid stack overflow on large files
      const u8 = new Uint8Array(buf);
      let bin = "";
      const CHUNK = 0x8000;
      for (let i = 0; i < u8.length; i += CHUNK) {
        bin += String.fromCharCode.apply(null, Array.from(u8.subarray(i, i + CHUNK)));
      }
      const dataBase64 = btoa(bin);
      setProgress(60);
      const res = await upload({
        data: { token, bucket, filename: file.name, contentType: file.type || "application/octet-stream", dataBase64 },
      });
      setProgress(100);
      onChange(res.url);
      setSuccess(true);
      toast.success(`${file.name} uploaded`);
    } catch (err) {
      const msg = (err as Error).message || "Upload failed";
      setError(msg);
      toast.error(msg);
    } finally {
      clearInterval(tick);
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
      setTimeout(() => setProgress(0), 600);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLastFile(file);
    await doUpload(file);
  }

  function retry() {
    if (lastFile) doUpload(lastFile);
  }

  const isImagePreview = value && /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(value);
  const isVideoPreview = value && /\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(value);

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-2 flex items-center gap-3 flex-wrap">
        {value && isImagePreview && (
          <img loading="lazy" decoding="async" src={value} alt="preview" className="h-16 w-16 rounded-lg object-cover glass" />
        )}
        {value && isVideoPreview && (
          <video src={value} muted playsInline preload="metadata" className="h-16 w-16 rounded-lg object-cover glass bg-black" />
        )}
        {value && !isImagePreview && !isVideoPreview && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="h-16 w-16 rounded-lg glass border border-border inline-flex items-center justify-center text-muted-foreground hover:text-primary"
            title="Open file"
          >
            <FileText className="h-6 w-6" />
          </a>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="h-11 px-4 rounded-xl glass border border-border hover:border-primary inline-flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : success ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Upload className="h-4 w-4" />}
          {busy ? "Uploading…" : value ? "Replace" : "Upload"}
        </button>
        {value && !busy && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setSuccess(false);
            }}
            className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Remove
          </button>
        )}
        {error && !busy && lastFile && (
          <button
            type="button"
            onClick={retry}
            className="text-xs text-amber-600 dark:text-amber-400 hover:text-primary inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Retry
          </button>
        )}
        <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
      </div>
      {busy && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-primary transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {error && !busy && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}


export type ProgramFormValues = {
  name: string;
  wing: string;
  event_date: string;
  event_time: string;
  end_time: string;
  venue: string;
  description: string;
  poster_url: string | null;
};

export function emptyProgramValues(defaultWing = ""): ProgramFormValues {
  return { name: "", wing: defaultWing, event_date: "", event_time: "", end_time: "", venue: "", description: "", poster_url: null };
}

export function programToValues(p: Program): ProgramFormValues {
  return {
    name: p.name,
    wing: p.wing,
    event_date: p.event_date,
    event_time: p.event_time || "",
    end_time: p.end_time || "",
    venue: p.venue || "",
    description: p.description || "",
    poster_url: p.poster_url,
  };
}

export function ProgramForm({
  values,
  onChange,
  token,
  wingLocked,
  extraWingOptions,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  values: ProgramFormValues;
  onChange: (v: ProgramFormValues) => void;
  token: string;
  wingLocked?: boolean;
  extraWingOptions?: ReadonlyArray<{ slug: string; name: string }>;
  submitting: boolean;
  submitLabel: string;
  onSubmit: () => void;
  onCancel?: () => void;
}) {
  const set = <K extends keyof ProgramFormValues>(k: K, v: ProgramFormValues[K]) =>
    onChange({ ...values, [k]: v });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="glass-strong rounded-3xl p-6 space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Program name</label>
          <input
            required
            maxLength={200}
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Organizing unit</label>
          <select
            required
            disabled={wingLocked}
            value={values.wing}
            onChange={(e) => set("wing", e.target.value)}
            className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none disabled:opacity-60"
          >
            <option value="">Select unit…</option>
            {WINGS.map((w) => (
              <option key={w.slug} value={w.slug}>{w.name}</option>
            ))}
            {extraWingOptions?.map((o) => (
              <option key={o.slug} value={o.slug}>{o.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Date</label>
            <input
              type="date"
              required
              value={values.event_date}
              onChange={(e) => set("event_date", e.target.value)}
              className="mt-2 w-full h-11 px-3 rounded-xl glass border border-border focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Start time (optional)</label>
            <input
              type="time"
              value={values.event_time}
              onChange={(e) => set("event_time", e.target.value)}
              className="mt-2 w-full h-11 px-3 rounded-xl glass border border-border focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">End time (optional)</label>
            <input
              type="time"
              value={values.end_time}
              onChange={(e) => set("end_time", e.target.value)}
              className="mt-2 w-full h-11 px-3 rounded-xl glass border border-border focus:border-primary outline-none"
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Venue (optional)</label>
          <input
            maxLength={200}
            value={values.venue}
            onChange={(e) => set("venue", e.target.value)}
            className="mt-2 w-full h-11 px-4 rounded-xl glass border border-border focus:border-primary outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Description</label>
          <textarea
            rows={3}
            maxLength={4000}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-xl glass border border-border focus:border-primary outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <FileUploadField
            label="Poster image (optional)"
            bucket="posters"
            token={token}
            value={values.poster_url}
            onChange={(url) => set("poster_url", url)}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="h-11 px-6 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant hover:shadow-gold disabled:opacity-50"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="h-11 px-4 rounded-xl glass border border-border hover:border-primary text-sm">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
