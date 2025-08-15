import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { imagetools } from 'vite-imagetools'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    imagetools(),
    visualizer({ filename: 'stats.html', open: false }) // run build, open stats.html to see bundle size
  ],
  build: {
    target: 'es2020', // avoid legacy JS for modern browsers
    cssCodeSplit: true, // split CSS by component
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // example: split vendor libs
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
})
