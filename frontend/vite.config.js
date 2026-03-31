// frontend/vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/blog-app/",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5176,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3008",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://127.0.0.1:3008",
        changeOrigin: true,
      },
    },
  },
});