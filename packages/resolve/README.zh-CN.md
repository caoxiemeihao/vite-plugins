# vite-plugin-resolve

[![npm package](https://nodei.co/npm/vite-plugin-resolve.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-resolve)
<br/>
[![NPM version](https://img.shields.io/npm/v/vite-plugin-resolve.svg?style=flat)](https://npmjs.org/package/vite-plugin-resolve)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-resolve.svg?style=flat)](https://npmjs.org/package/vite-plugin-resolve)

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
// vite.config.ts

import { builtinModules } from 'module'
import { defineConfig, build } from 'vite'
import resolve from 'vite-plugin-resolve'

export default defineConfig({
  plugins: [
    resolve({
      // 加载外部 vue 这个场景就是 external
      vue: `const vue = window.Vue; export { vue as default }`,

      // 支持嵌套模块命名，支持返回 Promis<string>
      '@scope/name': async () => await require('fs').promises.readFile('path', 'utf-8'),

      // 在 Electron 中使用
      electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer };`,

      // 将 Node.js ES Module 模块转换成 CommonJs 模块. 比如 execa, node-fetch
      ...['execa', 'node-fetch'].reduce((memo, moduleId) => Object.assign(memo, {
        async [moduleId](args) {
          await build({
            plugins: [
              {
                name: 'vite-plugin[node:mod-to-mod]',
                enforce: 'pre',
                resolveId(source) {
                  if (source.startsWith('node:')) {
                    return source.replace('node:', '')
                  }
                },
              }
            ],
            build: {
              outDir: args.dir,
              minify: false,
              emptyOutDir: false,
              lib: {
                entry: require.resolve(moduleId),
                formats: ['cjs'],
                fileName: () => `${moduleId}.js`,
              },
              rollupOptions: {
                external: [
                  ...builtinModules,
                ],
              },
            },
          })
        },
      } as Parameters<typeof resolve>[0]), {}),
    })
  ]
})
```

## API

### resolve(resolves[, options])

##### resolves

```ts
export interface ResolveArgs {
  /** 生成缓存文件夹 */
  dir: string;
}

export interface Resolves {
  [moduleId: string]:
  | string
  | ((args: ResolveArgs) =>
    | string
    | Promise<string | void>
    | void)
  | void;
}
```

##### options

```ts
export interface ResolveOptions {
  /**
   * 是否将模块插入到 "optimizeDeps.exclude"
   * @default true
   */
  optimizeDepsExclude: boolean;
  /**
   * 相对或绝对路径
   * @default ".vite-plugin-resolve"
   */
  dir: string;
}
```

## 工作原理

**用 Vue 来举个 🌰**

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

3. 默认会将 `vue` 添加到 `optimizeDeps.exclude` 中. 你可以通过 `options.optimizeDepsExclude` 禁用

```js
export default {
  optimizeDeps: {
    exclude: ['vue'],
  },
}
```