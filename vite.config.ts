import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// Pure static React + Vite SPA. No SSR, no server runtime.
// Output: dist/index.html + dist/assets/* — deploys to any static host.
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2022",
  },
  server: { port: 5173 },
  preview: { port: 4173 },
});
