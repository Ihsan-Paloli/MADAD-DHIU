import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trophy, FileText, Save, Send, Image as ImageIcon, Plus, X, Trash2 } from "lucide-react";
import { FileUploadField } from "@/components/ProgramForm";
import { deleteResult, upsertResult } from "@/lib/results.functions";
import type { EventResult } from "@/hooks/use-results";

export type ResultFormValues = {
  first_place: string;
  first_place_photo_url: string | null;
  second_place: string;
  second_place_photo_url: string | null;
  third_place: string;
  third_place_photo_url: string | null;
  special_mention: string;
  special_mention_photo_url: string | null;
  result_pdf_url: string | null;
  additional_info: string;
  gallery_image_urls: string[];
};

export function emptyResultValues(): ResultFormValues {
  return {
    first_place: "",
    first_place_photo_url: null,
    second_place: "",
    second_place_photo_url: null,
    third_place: "",
    third_place_photo_url: null,
    special_mention: "",
    special_mention_photo_url: null,
    result_pdf_url: null,
    additional_info: "",
    gallery_image_urls: [],
  };
}

export function resultToValues(r: EventResult): ResultFormValues {
  return {
    first_place: r.first_place || "",
    first_place_photo_url: r.first_place_photo_url,
    second_place: r.second_place || "",
    second_place_photo_url: r.second_place_photo_url,
    third_place: r.third_place || "",
    third_place_photo_url: r.third_place_photo_url,
    special_mention: r.special_mention || "",
    special_mention_photo_url: r.special_mention_photo_url,
    result_pdf_url: r.result_pdf_url,
    additional_info: r.additional_info || "",
    gallery_image_urls: r.gallery_image_urls || [],
  };
}

export function ResultForm({
  programId,
  programName,
  token,
  initial,
  currentStatus,
  hasExistingResult = false,
  onSaved,
  onCancel,
}: {
  programId: string;
  programName: string;
  token: string;
  initial: ResultFormValues;
  currentStatus: "draft" | "published";
  hasExistingResult?: boolean;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const qc = useQueryClient();
  const upsert = upsertResult;
  const remove = deleteResult;
  const [v, setV] = useState<ResultFormValues>(initial);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof ResultFormValues>(k: K, val: ResultFormValues[K]) =>
    setV((prev) => ({ ...prev, [k]: val }));

  async function save(publish: boolean) {
    setBusy(true);
    try {
      await upsert({
        data: {
          token,
          program_id: programId,
          first_place: v.first_place || null,
          first_place_photo_url: v.first_place_photo_url,
          second_place: v.second_place || null,
          second_place_photo_url: v.second_place_photo_url,
          third_place: v.third_place || null,
          third_place_photo_url: v.third_place_photo_url,
          special_mention: v.special_mention || null,
          special_mention_photo_url: v.special_mention_photo_url,
          result_pdf_url: v.result_pdf_url,
          gallery_image_urls: v.gallery_image_urls,
          additional_info: v.additional_info || null,
          status: publish ? "published" : "draft",
        },
      });
      qc.invalidateQueries({ queryKey: ["event_result", programId] });
      qc.invalidateQueries({ queryKey: ["programs"] });
      toast.success(publish ? "Result published" : "Draft saved");
      onSaved?.();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function addGalleryImage(url: string | null) {
    if (!url) return;
    setV((prev) => ({ ...prev, gallery_image_urls: [...prev.gallery_image_urls, url] }));
  }
  function removeGalleryImage(idx: number) {
    setV((prev) => ({ ...prev, gallery_image_urls: prev.gallery_image_urls.filter((_, i) => i !== idx) }));
  }

  async function deleteCurrentResult() {
    if (!confirm("Delete this result?")) return;
    setBusy(true);
    try {
      await remove({ data: { token, program_id: programId } });
      qc.invalidateQueries({ queryKey: ["event_result", programId] });
      qc.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Result deleted");
      onSaved?.();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-strong rounded-3xl p-6 space-y-5">
      <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-widest">
        <Trophy className="h-4 w-4" /> Result for {programName}
        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${currentStatus === "published" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
          {currentStatus}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {([
          ["first_place", "first_place_photo_url", "🥇 1st place"],
          ["second_place", "second_place_photo_url", "🥈 2nd place"],
          ["third_place", "third_place_photo_url", "🥉 3rd place"],
          ["special_mention", "special_mention_photo_url", "Special mention"],
        ] as const).map(([nameKey, photoKey, label]) => (
          <div key={nameKey} className="glass rounded-2xl p-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
            <input
              maxLength={200}
              placeholder="Winner / team name"
              value={v[nameKey] as string}
              onChange={(e) => set(nameKey, e.target.value)}
              className="w-full h-10 px-3 rounded-lg glass border border-border focus:border-primary outline-none text-sm"
            />
            <FileUploadField
              label="Photo (optional)"
              bucket="results"
              token={token}
              value={v[photoKey] as string | null}
              onChange={(url) => set(photoKey, url)}
            />
          </div>
        ))}
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
          <FileText className="h-3.5 w-3.5" /> Result PDF (optional)
        </div>
        <FileUploadField
          label=""
          bucket="results"
          token={token}
          value={v.result_pdf_url}
          onChange={(url) => set("result_pdf_url", url)}
          accept=".pdf,application/pdf"
        />
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
          <ImageIcon className="h-3.5 w-3.5" /> Photo gallery ({v.gallery_image_urls.length})
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {v.gallery_image_urls.map((url, i) => (
            <div key={url + i} className="relative h-20 w-20">
              <img loading="lazy" decoding="async" src={url} alt="" className="h-full w-full object-cover rounded-lg glass" />
              <button
                type="button"
                onClick={() => removeGalleryImage(i)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground inline-flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 inline-flex items-center gap-1"><Plus className="h-3 w-3" /> Add photo</div>
          <FileUploadField label="" bucket="gallery" token={token} value={null} onChange={addGalleryImage} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Additional info</label>
        <textarea
          rows={3}
          maxLength={4000}
          value={v.additional_info}
          onChange={(e) => set("additional_info", e.target.value)}
          className="mt-2 w-full px-4 py-3 rounded-xl glass border border-border focus:border-primary outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => save(false)}
          className="h-11 px-5 rounded-xl glass border border-border hover:border-primary inline-flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> Save draft
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => save(true)}
          className="h-11 px-5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Send className="h-4 w-4" /> {currentStatus === "published" ? "Update published" : "Publish"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-xs text-muted-foreground hover:text-primary">
            Close
          </button>
        )}
        {hasExistingResult && (
          <button type="button" disabled={busy} onClick={deleteCurrentResult} className="ml-auto text-xs text-destructive hover:text-destructive inline-flex items-center gap-1 disabled:opacity-50">
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        )}
      </div>
    </div>
  );
}
