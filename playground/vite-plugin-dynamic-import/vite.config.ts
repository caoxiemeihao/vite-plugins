import { join } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dynamicImport from 'vite-plugin-dynamic-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dynamicImport(),
    vue(),
  ],
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
  },
})
