# vite-plugin-optimizer [![NPM version](https://img.shields.io/npm/v/vite-plugin-optimizer.svg)](https://npmjs.org/package/vite-plugin-optimizer) [![awesome-vite](https://awesome.re/badge.svg)](https://github.com/vitejs/awesome-vite)

手动版的 Vite 预构建

**[English](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/resolve#readme) | 简体中文**

- 兼容 Browser, Node.js and Electron
- 自定义 Vite 预构建 [Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html) 内容

## 安装

```bash
npm i vite-plugin-optimizer -D
```

## 使用

```ts
import { defineConfig } from 'vite'
import optimizer from 'vite-plugin-optimizer'

export default defineConfig({
  plugins: [
    optimizer({
      vue: `const vue = window.Vue; export { vue as default }`,
    }),
  ]
})
```

#### 读取本地文件

```ts
optimizer({
  // 支持嵌套模块命名
  // 支持返回 Promise
  '@scope/name': () => require('fs/promises').readFile('path', 'utf-8'),
})
```

#### Electron 与 Node.js

```ts
optimizer({
  // 预构建 ipcRenderer 在 Electron 渲染进程中使用
  electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer };`,

  // 这表示 'fs' 与 'node:fs' 同时支持
  // e.g. `import fs from 'fs'` or `import fs from 'node:fs'`
  fs: () => ({
    // 这实际上是 `alias.find`
    find: /^(node:)?fs$/,
    code: `const fs = require('fs'); export { fs as default }`;
  }),
})
```

#### 将 ES 模块转换成 CommonJs 模块供 Node.js 使用

例如 [execa](https://www.npmjs.com/package/execa), [node-fetch](https://www.npmjs.com/package/node-fetch)

这里使用 Vite 作为构建工具  
你也可以选用其他的工具，比如 [rollup](https://rollupjs.org), [webpack](https://webpack.js.org), [esbuild](https://esbuild.github.io), [swc](https://swc.rs)  等等

```ts
import { builtinModules } from 'module'
import { defineConfig, build } from 'vite'
import optimizer from 'vite-plugin-optimizer'

export default defineConfig({
  plugins: [
    optimizer({
      async execa(args) {
        // 将 execa 构建成 CommonJs 模块
        await build({
          plugins: [
            {
              name: 'vite-plugin[node:mod-to-mod]',
              enforce: 'pre',
              // 将 import fs from "node:fs" 替换为 import fs from "fs"
              resolveId(source) {
                if (source.startsWith('node:')) {
                  return source.replace('node:', '')
                }
              },
            }
          ],

          // 将 execa.js 写入到缓存目录
          build: {
            outDir: args.dir,
            minify: false,
            emptyOutDir: false,
            lib: {
              entry: require.resolve('execa'),
              formats: ['cjs'],
              fileName: () => `execa.js`,
            },
            rollupOptions: {
              external: [
                ...builtinModules,
              ],
            },
          },
        })
      },
    })
  ]
})
```

## API

### Optimizer(entries[, options])

##### entries

```ts
export interface Entries {
  [moduleId: string]:
    | string
    | ResultDescription
    | ((args: OptimizerArgs) => string | ResultDescription | Promise<string | ResultDescription | void> | void)
    | void;
}

export interface OptimizerArgs {
  /** 生成缓存文件夹 */
  dir: string;
}

export interface ResultDescription {
  find?: find?: string | RegExp;
  code: string;
}
```

##### options

```ts
export interface OptimizerOptions {
  /**
   * @default ".vite-plugin-optimizer"
   */
  dir?: string;
  /**
   * @default ".js"
   */
  ext?: string;
}
```

## 工作原理

#### 用 Vue 来举个 🌰

```js
optimizer({
  vue: `const vue = window.Vue; export { vue as default }`,
})
```

1. 创建 `node_modules/.vite-plugin-optimizer/vue.js` 文件并包含下面的代码

```js
const vue = window.Vue; export { vue as default }
```

2. 创建一个 `vue` 的别名项，并且添加到 `resolve.alias`

```js
{
  resolve: {
    alias: [
      {
        find: 'vue',
        replacement: '/User/work-directory/node_modules/.vite-plugin-optimizer/vue',
      },
    ],
  },
}
```

3. 默认会将 `vue` 添加到 `optimizeDeps.exclude` 中  
  你可以通过 `optimizeDeps.include` 绕开

```js
export default {
  optimizeDeps: {
    exclude: ['vue'],
  },
}
```
