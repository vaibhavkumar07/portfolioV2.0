import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/portfolioV2.0/",
  optimizeDeps: {
    exclude: ["@react-three/fiber", "@react-three/drei"],
  },
});
