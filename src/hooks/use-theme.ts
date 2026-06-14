import { useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("madad-theme");
    } catch {}
    const next: Theme = stored === "light" ? "light" : "dark";
    const root = document.documentElement;
    if (next === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    setTheme(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      const root = document.documentElement;
      if (next === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
      try {
        localStorage.setItem("madad-theme", next);
      } catch {}
      return next;
    });
  }, []);

  return { theme, toggle };
}
