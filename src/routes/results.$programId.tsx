import { useDocumentMeta } from "@/lib/use-document-meta";
import { Link, useParams } from "react-router-dom";import { PageHeader, PageShell } from "@/components/PageShell";
import { usePrograms } from "@/hooks/use-programs";
import { useResultForProgram } from "@/hooks/use-results";
import { WINGS } from "@/lib/madad-data";
import { Trophy, FileText, Calendar, MapPin, ArrowLeft } from "lucide-react";


function wingName(slug: string) {
  return WINGS.find((w) => w.slug === slug)?.name ?? slug;
}

function WinnerCard({ place, name, photo, accent }: { place: string; name: string; photo: string | null; accent: string }) {
  return (
    <div className="glass-strong rounded-2xl p-5 flex items-center gap-4">
      {photo ? (
        <img loading="lazy" decoding="async" src={photo} alt={name} className="h-20 w-20 rounded-xl object-cover" />
      ) : (
        <div className={`h-20 w-20 rounded-xl ${accent} flex items-center justify-center text-3xl`}>
          <Trophy className="h-8 w-8 text-primary-foreground" />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-gold">{place}</div>
        <div className="font-display font-semibold text-lg mt-0.5 truncate">{name}</div>
      </div>
    </div>
  );
}

function ResultPage() {
  useDocumentMeta({ title: 'Event Result — MADAD' });

  const { programId } = useParams();
  const { data: programs, loading } = usePrograms();
  const program = programs.find((p) => p.id === programId);
  const { data: result, isLoading } = useResultForProgram(programId);

  return (
    <PageShell>
      <PageHeader
        eyebrow={program ? wingName(program.wing) : "Result"}
        title={program?.name ?? "Event result"}
        description={program?.description ?? "Official result published by MADAD."}
      />
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-6 space-y-8">
          <Link to="/events" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to Events Diary
          </Link>

          {program && (
            <div className="glass rounded-2xl p-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" /> {new Date(program.event_date).toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              {program.venue && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> {program.venue}</span>}
            </div>
          )}

          {(loading || isLoading) && <div className="text-sm text-muted-foreground">Loading result…</div>}

          {!isLoading && !result && (
            <div className="glass-strong rounded-2xl p-10 text-center">
              <Trophy className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-display text-lg font-semibold">Result not yet published</h3>
              <p className="text-sm text-muted-foreground mt-1">The official result will appear here once published by the organizing wing.</p>
            </div>
          )}

          {result && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                {result.first_place && <WinnerCard place="1st place" name={result.first_place} photo={result.first_place_photo_url} accent="bg-gradient-to-br from-amber-400 to-yellow-600" />}
                {result.second_place && <WinnerCard place="2nd place" name={result.second_place} photo={result.second_place_photo_url} accent="bg-gradient-to-br from-slate-300 to-slate-500" />}
                {result.third_place && <WinnerCard place="3rd place" name={result.third_place} photo={result.third_place_photo_url} accent="bg-gradient-to-br from-amber-700 to-amber-900" />}
                {result.special_mention && <WinnerCard place="Special mention" name={result.special_mention} photo={result.special_mention_photo_url} accent="bg-gradient-primary" />}
              </div>

              {result.result_pdf_url && (
                <a
                  href={result.result_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant"
                >
                  <FileText className="h-4 w-4" /> Download official result (PDF)
                </a>
              )}

              {result.additional_info && (
                <div className="glass-strong rounded-2xl p-6">
                  <div className="text-xs font-semibold uppercase tracking-widest text-gold mb-2">Notes</div>
                  <p className="text-sm whitespace-pre-line">{result.additional_info}</p>
                </div>
              )}

              {result.gallery_image_urls && result.gallery_image_urls.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-gold mb-3">Photo gallery</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {result.gallery_image_urls.map((url, i) => (
                      <a key={url + i} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square glass rounded-xl overflow-hidden">
                        <img loading="lazy" decoding="async" src={url} alt="" className="h-full w-full object-cover hover:scale-105 transition" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {result.published_at && (
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground text-center">
                  Published {new Date(result.published_at).toLocaleString()}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}

export default ResultPage;
