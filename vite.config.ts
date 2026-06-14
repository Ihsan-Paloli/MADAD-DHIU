import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
// Pure static React + Vite SPA. No SSR, no server runtime.
// Output: dist/index.html + dist/assets/* — deploys to any static host.
export default defineConfig({
  plugins: [
  react(),
  tsconfigPaths(),
  tailwindcss(),
  VitePWA({
    registerType: "autoUpdate",
    manifest: {
      name: "MADAD DHIU",
      short_name: "MADAD",
      description: "MADAD DHIU Official App",
      theme_color: "#16a34a",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
  }),
],
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2022",
  },
  server: { port: 5173 },
  preview: { port: 4173 },
});
