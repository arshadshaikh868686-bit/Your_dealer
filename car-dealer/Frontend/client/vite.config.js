import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { 
    dedupe: ["react", "react-dom"] 
  },
  build: {
    rolldownOptions: {
      external: (id) => {
        if (id.startsWith('vite/') || id.startsWith('.') || id.startsWith('/') || id.startsWith('\0')) {
          return false;
        }
        return true;
      }
    }
  }
});
