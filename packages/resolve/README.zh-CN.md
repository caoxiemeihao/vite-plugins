# vite-plugin-resolve

[![NPM version](https://img.shields.io/npm/v/vite-plugin-resolve.svg)](https://npmjs.org/package/vite-plugin-resolve)
[![NPM Downloads](https://img.shields.io/npm/dw/vite-plugin-resolve.svg)](https://npmjs.org/package/vite-plugin-resolve)

自定义加载模块内容

**English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/resolve#readme)**

- 兼容 Browser, Node.js and Electron
- 你可以认为它是一个加强版的 Vite external 插件
- 你可以认为它是手动版的 Vite 预构建 [Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html)

## 安装

```bash
npm i vite-plugin-resolve -D
```

## 使用

```ts
import { defineConfig } from 'vite'
import resolve from 'vite-plugin-resolve'

export default defineConfig({
  plugins: [
    resolve({
      // 加载自定模块内容
      // 这个场景就是 external
      vue: `const vue = window.Vue; export { vue as default }`,
    }),
  ]
})
```

#### 读取本地文件

```ts
resolve({
  // 支持嵌套模块命名
  // 支持返回 Promise
  '@scope/name': async () => await require('fs').promises.readFile('path', 'utf-8'),
})
```

#### Electron

```ts
resolve({
  // 在 Electron 渲染进程中加载 ipcRenderer
  electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer };`,
})
```

#### 将 ES 模块转换成 CommonJs 模块供 Node.js 使用

例如 [execa](https://www.npmjs.com/package/execa), [node-fetch](https://www.npmjs.com/package/node-fetch)

这里使用 "vite" 作为构建工具  
你也可以选用其他的工具，比如 [rollup](https://rollupjs.org), [webpack](https://webpack.js.org), [esbuild](https://esbuild.github.io), [swc](https://swc.rs)  等等

```ts
import { builtinModules } from 'module'
import { defineConfig, build } from 'vite'
import resolve from 'vite-plugin-resolve'

export default defineConfig({
  plugins: [
    resolve({
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

### resolve(resolves[, options])

##### resolves

```ts
export interface Resolves {
  [moduleId: string]:
  | string
  | ((args: ResolveArgs) =>
    | string
    | Promise<string | void>
    | void)
  | void;
}

export interface ResolveArgs {
  /** 生成缓存文件夹 */
  dir: string;
}
```

##### options

```ts
export interface ResolveOptions {
  /**
   * 相对或绝对路径
   * @default ".vite-plugin-resolve"
   */
  dir: string;
}
```

## 工作原理

#### 用 Vue 来举个 🌰

```js
viteResolve({
  vue: `const vue = window.Vue; export { vue as default }`,
})
```

1. 创建 `node_modules/.vite-plugin-resolve/vue.js` 文件并包含下面的代码

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
        replacement: 'User/work-directory/node_modules/.vite-plugin-resolve/vue.js',
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