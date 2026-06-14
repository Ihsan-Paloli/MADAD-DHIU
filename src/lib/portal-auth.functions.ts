// Portal authentication wrappers (Edge Function backed).
// Admin-token issuance forwards the user's Supabase Auth bearer so the
// edge function can verify role=admin server-side.
import { supabase } from "@/integrations/supabase/client";
import { invokeEdge } from "@/lib/invoke-edge";

const FN = "portal-auth";
const call = (action: string) => (args: { data: any }) => invokeEdge<any>(FN, action, args.data);

export const verifyPortalPassword = call("verifyPortalPassword");
export const createAnnouncementWithToken = call("createAnnouncementWithToken");
export const deleteAnnouncementWithToken = call("deleteAnnouncementWithToken");

// Admin-only — these implicitly forward the Authorization header from supabase-js.
export const issueAdminToken = async (_args: { data?: any } = { data: {} }) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Sign in required");
  const { data, error } = await supabase.functions.invoke(FN, {
    body: { action: "issueAdminToken", data: {} },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data;
};

export const setPortalPassword = async (args: { data: any }) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Sign in required");
  const { data, error } = await supabase.functions.invoke(FN, {
    body: { action: "setPortalPassword", data: args.data },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data;
};
