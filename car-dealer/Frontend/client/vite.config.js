import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { 
    dedupe: ["react", "react-dom"] 
  },
  build: {
    // Rolldown ko strict constraints se hatakar basic application bundle karne ke liye default par set karein
    rollupOptions: {
      external: []
    }
  }
});
