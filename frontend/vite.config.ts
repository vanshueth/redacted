import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// The FHE SDK and ethers.js use some Node.js built-ins (Buffer, crypto, etc.)
// nodePolyfills makes those available in the browser environment.
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["buffer", "crypto", "stream", "util", "process"],
      globals: { Buffer: true, global: true, process: true },
    }),
  ],
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
