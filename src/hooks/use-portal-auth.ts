import { useCallback, useEffect, useState } from "react";

export type PortalId = "admin" | "events" | "auditing";

const key = (p: PortalId) => `madad_portal_token_${p}`;

export function usePortalAuth(portal: PortalId) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setToken(localStorage.getItem(key(portal)));
    } catch {}
    setReady(true);
  }, [portal]);

  const signIn = useCallback((newToken: string) => {
    localStorage.setItem(key(portal), newToken);
    setToken(newToken);
  }, [portal]);

  const signOut = useCallback(() => {
    localStorage.removeItem(key(portal));
    setToken(null);
  }, [portal]);

  return { token, ready, signIn, signOut };
}
