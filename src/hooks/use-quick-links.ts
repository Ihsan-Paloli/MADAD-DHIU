import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type QuickLink = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category: "events" | "academic" | "institutional" | "partner" | "media" | "other";
  icon_url: string | null;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

const KEY = ["quick_links"] as const;

async function fetchLinks(): Promise<QuickLink[]> {
  const { data } = await (supabase as any)
    .from("quick_links")
    .select("*")
    .eq("enabled", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data as QuickLink[]) ?? [];
}

export function useQuickLinks() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: KEY, queryFn: fetchLinks, staleTime: 5 * 60_000 });
  useEffect(() => {
    const ch = supabase
      .channel(`public:quick_links:${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "quick_links" }, () => {
        qc.invalidateQueries({ queryKey: KEY });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);
  return { data, loading: isLoading };
}
