import { join } from 'path'
import { defineConfig } from 'vite'
import dynamicImport from 'vite-plugin-dynamic-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dynamicImport(),
  ],
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
      'src/': join(__dirname, 'src/'),
      '/root/src': join(__dirname, 'src'),
    },
  },
})
