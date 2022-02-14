# vite-plugin-resolve

[![npm package](https://nodei.co/npm/vite-plugin-resolve.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-resolve)
<br/>
[![NPM version](https://img.shields.io/npm/v/vite-plugin-resolve.svg?style=flat)](https://npmjs.org/package/vite-plugin-resolve)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-resolve.svg?style=flat)](https://npmjs.org/package/vite-plugin-resolve)

Custom resolve module content

**English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/resolve/README.zh-CN.md)**

- It can be compatible with Browser, Node.js and Electron, without environment
- You can think of it as an enhanced Vite external plugin
- You can think of it as manual version [Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html)

## Install

```bash
npm i -D vite-plugin-resolve
```

## Usage

```js
import { defineConfig } from 'vite'
import viteResolve from 'vite-plugin-resolve'

export default defineConfig({
  plugins: [
    viteResolve({
      // resolve external module, this like Vite external plugin
      vue: `const vue = window.Vue; export { vue as default }`,

      // nested moduleId and return Promis<string>
      '@scope/name': async () => await require('fs').promises.readFile('path', 'utf-8'),

      // electron
      electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer };`,
    })
  ]
})
```

## Type define

```ts
export type viteResolve = (
  resolves: [moduleId: string]: string | (() => string | Promise<string>),
  options?: {
    /**
     * @default true
     * Whether to insert the resolve module into "optimizeDeps.exclude"
     */
    optimizeDepsExclude: boolean
  }
) => import('vite').VitePlugin
```

## How to work

**Let's use Vue as an example**

```js
viteResolve({
  vue: `const vue = window.Vue; export { vue as default }`,
})
```

1. Create `node_modules/.vite-plugin-resolve/vue.js` and contains the following code

```js
const vue = window.Vue; export { vue as default }
```

2. Create a `vue` alias item and add it to `resolve.alias`

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

3. Add `vue` to the `optimizeDeps.exclude` **by default**. You can disable it through `options.optimizeDepsExclude`

```js
export default {
  optimizeDeps: {
    exclude: ['vue'],
  },
}
```