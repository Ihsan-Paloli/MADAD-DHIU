import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  wing: string | null;
  created_at: string;
};

const KEY = ["announcements"] as const;

async function fetchAnnouncements(): Promise<Announcement[]> {
  const { data } = await supabase
    .from("announcements")
    .select("id,title,body,wing,created_at")
    .order("created_at", { ascending: false });
  return (data as Announcement[]) ?? [];
}

export function useAnnouncements() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: KEY,
    queryFn: fetchAnnouncements,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`public:announcements:${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, (payload: any) => {
        qc.setQueryData<Announcement[]>(KEY, (curr = []) => {
          if (payload.eventType === "INSERT") {
            const np = payload.new as Announcement;
            if (curr.some((a) => a.id === np.id)) return curr;
            return [np, ...curr];
          }
          if (payload.eventType === "UPDATE") {
            const np = payload.new as Announcement;
            if (!curr.some((a) => a.id === np.id)) return [np, ...curr];
            return curr.map((a) => (a.id === np.id ? np : a));
          }
          if (payload.eventType === "DELETE")
            return curr.filter((a) => a.id !== (payload.old as Announcement).id);
          return curr;
        });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return { data, loading: isLoading };
}
