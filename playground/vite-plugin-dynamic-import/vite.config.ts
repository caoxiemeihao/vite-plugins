import { join } from 'path'
import { defineConfig } from 'vite'
import dynamicImport from '../../packages/dynamic-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dynamicImport(),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: join(__dirname, 'src') },
      { find: /^src\//, replacement: join(__dirname, 'src/') },
      { find: '/root/src', replacement: join(__dirname, 'src') },
    ],
  },
  build: {
    minify: false,
  },
})
