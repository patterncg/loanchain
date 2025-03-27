import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@loanchain/contract-integration": path.resolve(__dirname, "../../packages/contract-integration/src"),
      "@loanchain/metadata": path.resolve(__dirname, "../../packages/metadata/src"),
      "@loanchain/storage": path.resolve(__dirname, "../../packages/storage/src"),
    },
  },
  optimizeDeps: {
    include: ["@loanchain/contract-integration", "@loanchain/metadata", "@loanchain/storage"],
  },
});
