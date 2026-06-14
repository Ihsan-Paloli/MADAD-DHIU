import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Program = {
  id: string;
  name: string;
  wing: string;
  event_date: string;
  event_time: string | null;
  end_time: string | null;
  venue: string | null;
  description: string | null;
  poster_url: string | null;
  status: "draft" | "registration_open" | "registration_closed" | "completed" | "result_published" | "archived";
  result_status: "pending" | "draft" | "published";
  archived_at: string | null;
  created_by_portal: string;
  created_at: string;
  updated_at: string;
};

const KEY = ["programs"] as const;

async function fetchPrograms(): Promise<Program[]> {
  const { data } = await supabase
    .from("programs")
    .select("*")
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true });
  return (data as Program[]) ?? [];
}

export function usePrograms() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: KEY,
    queryFn: fetchPrograms,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`public:programs:${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "programs" }, (payload: any) => {
        qc.setQueryData<Program[]>(KEY, (curr = []) => {
          if (payload.eventType === "INSERT") {
            const np = payload.new as Program;
            if (curr.some((p) => p.id === np.id)) return curr;
            return [...curr, np];
          }
          if (payload.eventType === "UPDATE") {
            const np = payload.new as Program;
            if (!curr.some((p) => p.id === np.id)) return [...curr, np];
            return curr.map((p) => (p.id === np.id ? np : p));
          }
          if (payload.eventType === "DELETE")
            return curr.filter((p) => p.id !== (payload.old as Program).id);
          return curr;
        });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const sorted = [...data].sort((a, b) => {
    const da = new Date(`${a.event_date}T${a.event_time || "00:00"}`);
    const db = new Date(`${b.event_date}T${b.event_time || "00:00"}`);
    return da.getTime() - db.getTime();
  });
  const upcoming = sorted.filter((p) => new Date(p.event_date) >= now);
  const past = sorted.filter((p) => new Date(p.event_date) < now).reverse();

  return { data: sorted, upcoming, past, loading: isLoading };
}
