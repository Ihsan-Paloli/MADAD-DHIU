import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type GalleryPhoto = {
  id: string;
  image_url: string;
  caption: string | null;
  category: string | null;
  wing: string | null;
  event_year: number | null;
  program_id: string | null;
  created_at: string;
};

const KEY = ["gallery_photos"] as const;

async function fetchPhotos(): Promise<GalleryPhoto[]> {
  const { data } = await supabase
    .from("gallery_photos")
    .select("id,image_url,caption,category,wing,event_year,program_id,created_at")
    .order("created_at", { ascending: false });
  return (data as GalleryPhoto[]) ?? [];
}

export function useGallery() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: KEY,
    queryFn: fetchPhotos,
    staleTime: 5 * 60_000,
  });
  useEffect(() => {
    const channel = supabase
      .channel(`public:gallery_photos:${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "gallery_photos" }, () => {
        qc.invalidateQueries({ queryKey: KEY });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);
  return { data, loading: isLoading };
}
