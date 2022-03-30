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

## 高级

#### 将 ES 模块转换成 CommonJs 模块供 Node.js 使用

例如 [execa](https://www.npmjs.com/package/execa)，[node-fetch](https://www.npmjs.com/package/node-fetch)，你可以看这个 👉 [vite-plugin-esmodule](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/esmodule)

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
  alias?: { find: string | RegExp; replacement: string };
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
/**
 * 🚧
 * 如果你是用的是 function 并且没有返回值, 那么就不会注册 alias
 * 这种情况下, 你必须显式的返回 alias
 * 
 * e.g.
 * 
 * optimizer({
 *   vue(args) {
 *     // 你可能会自己构建 "vue" 并且输出到指定的文件夹
 *     // e.g.
 *     build({
 *       entry: require.resolve('vue'),
 *       outputDir: args.dir + '/vue',
 *     })
 * 
 *     return {
 *       alias: {
 *         find: 'vue',
 *         replacement: args.dir + '/vue',
 *       }
 *     }
 *   },
 * })
 */
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
