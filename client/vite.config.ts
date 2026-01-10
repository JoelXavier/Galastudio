import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/integrate": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/analyze_chaos": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/export": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/integrate_evolution": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/compute_potential_grid": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/analyze_frequencies": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/docs": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
