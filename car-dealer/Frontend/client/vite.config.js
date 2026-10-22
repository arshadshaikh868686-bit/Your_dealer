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
      // Vercel build machine par unresolved modules ki specific warnings ko build break karne se rokein
      onwarn(warning, warn) {
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        warn(warning);
      }
    }
  }
});
