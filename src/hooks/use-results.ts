import { useQuery } from "@tanstack/react-query";
import { getResultForProgram } from "@/lib/results.functions";

export type EventResult = {
  id: string;
  program_id: string;
  first_place: string | null;
  first_place_photo_url: string | null;
  second_place: string | null;
  second_place_photo_url: string | null;
  third_place: string | null;
  third_place_photo_url: string | null;
  special_mention: string | null;
  special_mention_photo_url: string | null;
  result_pdf_url: string | null;
  gallery_image_urls: string[];
  additional_info: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function useResultForProgram(programId: string | undefined, token?: string | null) {
  const fn = getResultForProgram;
  return useQuery({
    queryKey: ["event_result", programId, token ? "auth" : "anon"],
    enabled: !!programId,
    staleTime: 60_000,
    queryFn: async () => {
      const res = await fn({ data: { program_id: programId!, token: token || undefined } });
      return (res.result as EventResult | null) ?? null;
    },
  });
}
