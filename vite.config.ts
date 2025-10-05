import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import { defineConfig } from "vite";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  // base: "./", // <-- Add this line right here
  plugins: [
    react(),
    tailwindcss(),
    mdx({
      jsxImportSource: "react",
      remarkPlugins: [
        remarkGfm,
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "frontmatter" }],
      ],
      providerImportSource: "@mdx-js/react",
    }),
  ],
  resolve: {
    alias: {
      // "@": path.resolve(__dirname, "./src"),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "chart-vendor": ["recharts"],
          // Blog-specific chunk with MDX provider and content
          "blog-chunk": [
            "@mdx-js/react",
            "/src/components/BlogMDXProvider",
            "/src/content/blog/spestete-pari.mdx",
            "/src/content/blog/inflatsiya-i-tehnologii.mdx",
            "/src/content/blog/novini-ot-obshtnostta.mdx",
            "/src/content/blog/optimizirane-pazarska-lista.mdx",
            "/src/content/blog/analiz-na-pazara-2025.mdx",
            "/src/content/blog/ai-pazaruване.mdx",
            "/src/content/blog/statistika-i-danni.mdx",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
