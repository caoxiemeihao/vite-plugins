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

## 原理

#### 插件只做了两件事

1. 在开发期将 `electron` 相关的模块编译成了 `commonjs` 格式

```ts
import { ipcRenderer } from 'electron'
import Store from 'electron-store'
// Will generate
const { ipcRenderer } = require("electron")
const Store = require("electron-store")
```

2. 增加了 `vite.config.ts` 默认配置

```ts
{
  optimizeDeps: {
    exclude: [
      'electron'
    ]
  },
  build: {
    rollupOptions: {
      external: [
        'electron'
      ],
      output: {
        format: 'cjs'
      }
    }
  }
}
```
