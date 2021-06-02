# An vite plugin for electron integration.

## Usage

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
  // other config...
}))
```

> renderer/foo.ts
  ```ts
  // You code
  import { ipcRenderer } from 'electron'
  import Store from 'electron-store'

  // Will be generate in development mode
  const { ipcRenderer } = require("electron")
  const Store = require("electron-store")
  ```

## Principe | 原理

#### The plugin is do only two things | 插件只做了两件事

1. In the development phase, the modules related to `Electron` are compiled into `CommonJs` syntax<br>
  在开发期将 `Electron` 相关的模块编译成了 `CommonJs` 格式

```ts
// You code
import { ipcRenderer } from 'electron'
import Store from 'electron-store'

// Will be generate in development mode
const { ipcRenderer } = require("electron")
const Store = require("electron-store")
```

2. Add some config options into `vite.config.ts`<br>
  增加了 `vite.config.ts` 默认配置

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
