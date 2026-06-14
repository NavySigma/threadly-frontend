import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Threadly",
        short_name: "Threadly",
        description: "Platform tanya jawab programming",
        theme_color: "#111113",
        icons: [
          {
            src: "/src/assets/threadly-removebg-preview.jpeg",
            sizes: "192x192",
            type: "image/jpeg",
          },
          {
            src: "/src/assets/threadly-removebg-preview.jpeg",
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
        shortcuts: [
          {
            name: "Threadly",
            short_name: "Threadly",
            description: "Buka Threadly",
            url: "/",
            icons: [
              {
                src: "/src/assets/threadly-removebg-preview.jpeg",
                sizes: "192x192",
                type: "image/jpeg",
              },
            ],
          },
        ],
      },
    }),
  ],
});
