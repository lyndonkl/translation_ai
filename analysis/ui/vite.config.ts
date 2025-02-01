import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import fs from 'fs'
import path from 'path'

// Plugin to inject translation data into the HTML
function injectTranslationData(): Plugin {
  return {
    name: 'inject-translation-data',
    transformIndexHtml(html) {
      // Get the test folder from environment variable
      const testFolder = process.env.VITE_TEST_FOLDER || 'test1';
      
      // Read translation data from the specified test folder
      const testDir = path.resolve(__dirname, '../testing', testFolder);
      const translations: Record<string, any> = {};
      
      ['spanish', 'arabic', 'vietnamese', 'chinese'].forEach(lang => {
        const filePath = path.join(testDir, `output_${lang}.json`);
        if (fs.existsSync(filePath)) {
          translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
      });

      // Inject data as a global variable
      const script = `<script>window.__TRANSLATION_DATA__ = ${JSON.stringify(translations)};</script>`;
      return html.replace('</head>', `${script}</head>`);
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    injectTranslationData()
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsInlineLimit: 100000000,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
}) 