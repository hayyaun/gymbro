import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const base = "/gymbro/";
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      base,
      scope: base,
      registerType: "prompt",
      includeAssets: ["app-icon.svg", "apple-touch-icon.png"],
      manifest: {
        id: base,
        name: "جیم برو | استودیو مربی",
        short_name: "جیم برو",
        description: "طراحی و ذخیره برنامه تمرینی اختصاصی برای مربی ها",
        lang: "fa",
        dir: "rtl",
        start_url: base,
        scope: base,
        display: "standalone",
        theme_color: "#dc3045",
        background_color: "#f7f8fa",
        icons: [
          {
            src: `${base}icon-192.png`,
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${base}icon-512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${base}icon-maskable-512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        cacheId: "gymbro",
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,woff,woff2}"],
        navigateFallback: `${base}index.html`,
        navigateFallbackAllowlist: [/^\/gymbro(?:\/|$)/],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
