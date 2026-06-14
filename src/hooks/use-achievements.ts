import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Achievement = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  achievement_year: number;
  achievement_date: string | null;
  photo_url: string | null;
  certificate_url: string | null;
  level: "institution" | "district" | "state" | "national" | "international" | "special" | null;
  related_program_id: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

const KEY = ["achievements"] as const;

async function fetchAll(): Promise<Achievement[]> {
  const { data } = await (supabase as any)
    .from("achievements")
    .select("*")
    .eq("archived", false)
    .order("achievement_year", { ascending: false })
    .order("created_at", { ascending: false });
  return (data as Achievement[]) ?? [];
}

export function useAchievements() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: KEY, queryFn: fetchAll, staleTime: 5 * 60_000 });
  useEffect(() => {
    const ch = supabase
      .channel(`public:achievements:${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "achievements" }, () => {
        qc.invalidateQueries({ queryKey: KEY });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);
  return { data, loading: isLoading };
}
