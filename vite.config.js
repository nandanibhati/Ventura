import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Writes dist/stats.html on every build — open it to see what's actually inside each chunk.
    visualizer({ filename: "dist/stats.html", gzipSize: true, brotliSize: true }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Gives these heavy, widely-shared deps stable, named chunks instead of letting the
        // bundler fold them into an arbitrarily-named shared chunk (previously showed up as an
        // oddly large "Navigation-*.js" bundle with no relation to the actual Navigation
        // component). Function form, not the object form — this Vite version builds on Rolldown,
        // which only accepts a function here.
        manualChunks(id) {
          if (id.includes("node_modules/recharts")) return "charts";
          if (id.includes("node_modules/framer-motion")) return "motion";
          if (id.includes("node_modules/@dnd-kit")) return "dnd";
        },
      },
    },
  },
});