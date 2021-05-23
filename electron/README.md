# An vite plugin for electron integration.

## usage

- vite.config.ts

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vitejs-plugin-electron'

export default defineConfig((env) => ({
  plugins: [
    vue(),
    electron(),
  ],
}))
```
