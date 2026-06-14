import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type StationeryItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

const STATIONERY_KEY = ["stationery_items"] as const;

async function fetchStationery(): Promise<StationeryItem[]> {
  const { data } = await supabase
    .from("stationery_items")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as StationeryItem[]) ?? [];
}

export function useStationery() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: STATIONERY_KEY,
    queryFn: fetchStationery,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`public:stationery_items:${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "stationery_items" }, (payload: any) => {
        qc.setQueryData<StationeryItem[]>(STATIONERY_KEY, (curr = []) => {
          if (payload.eventType === "INSERT") {
            const np = payload.new as StationeryItem;
            if (curr.some((p) => p.id === np.id)) return curr;
            return [np, ...curr];
          }
          if (payload.eventType === "UPDATE") {
            const np = payload.new as StationeryItem;
            if (!curr.some((p) => p.id === np.id)) return [np, ...curr];
            return curr.map((p) => (p.id === np.id ? np : p));
          }
          if (payload.eventType === "DELETE")
            return curr.filter((p) => p.id !== (payload.old as StationeryItem).id);
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

export type AuditReport = {
  id: string;
  title: string;
  body: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
};

const REPORTS_KEY = ["audit_reports"] as const;

async function fetchReports(): Promise<AuditReport[]> {
  const { data } = await supabase
    .from("audit_reports")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as AuditReport[]) ?? [];
}

export function useReports() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: REPORTS_KEY,
    queryFn: fetchReports,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`public:audit_reports:${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "audit_reports" }, (payload: any) => {
        qc.setQueryData<AuditReport[]>(REPORTS_KEY, (curr = []) => {
          if (payload.eventType === "INSERT") {
            const np = payload.new as AuditReport;
            if (curr.some((p) => p.id === np.id)) return curr;
            return [np, ...curr];
          }
          if (payload.eventType === "UPDATE") {
            const np = payload.new as AuditReport;
            if (!curr.some((p) => p.id === np.id)) return [np, ...curr];
            return curr.map((p) => (p.id === np.id ? np : p));
          }
          if (payload.eventType === "DELETE")
            return curr.filter((p) => p.id !== (payload.old as AuditReport).id);
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
