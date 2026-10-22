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
      // Vercel build machine par unmanaged / missing packages ko bundle crash karne se rokein
      external: ['axios']
    }
  }
});
