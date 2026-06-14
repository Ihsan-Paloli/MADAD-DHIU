/**
 * Thin client for calling Supabase Edge Functions.
 * Each *.functions.ts module is a wrapper that calls a single edge function
 * with `{ action, data }` payload. The service role key stays server-side.
 */
import { supabase } from "@/integrations/supabase/client";

export async function invokeEdge<T = any>(
  functionName: string,
  action: string,
  data: any,
): Promise<T> {
  const { data: result, error } = await supabase.functions.invoke(functionName, {
    body: { action, data },
  });
  if (error) {
    // Try to extract server-provided error message from the response body.
    let msg = error.message || "Request failed";
    try {
      // @ts-ignore — context may carry the response
      const ctx: any = (error as any).context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error) msg = body.error;
      }
    } catch {}
    throw new Error(msg);
  }
  if (result && typeof result === "object" && "error" in result && result.error) {
    throw new Error(String((result as any).error));
  }
  return result as T;
}
