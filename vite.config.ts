import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { prepareBuildCatalog } from "./scripts/prepare-build-catalog.mjs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    allowedHosts: ["terminal.local"],
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), { name: 'deployable-catalog', apply: 'build' as const, async buildStart() { await prepareBuildCatalog(path.resolve(__dirname, 'public/data')); } }, mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
