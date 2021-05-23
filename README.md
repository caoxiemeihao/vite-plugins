# An vite plugin for electron integration.

## usage

- vite.config.ts

```ts
import { defineConfig } from 'vite'
import electron from 'vitejs-plugin-electron'

export default defineConfig(({ command }) => ({
  plugins: [
    command === 'serve' && electron(),
  ].filter(Boolean),
}))
```
