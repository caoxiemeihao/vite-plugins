# vite-plugin-optimizer [![NPM version](https://img.shields.io/npm/v/vite-plugin-optimizer.svg)](https://npmjs.org/package/vite-plugin-optimizer) [![awesome-vite](https://awesome.re/badge.svg)](https://github.com/vitejs/awesome-vite)

Manually Pre-Bundling of Vite

**English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/optimizer/README.zh-CN.md)**

- Compatible Browser, Node.js and Electron
- Custom Vite [Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html) content

## Install

```bash
npm i vite-plugin-optimizer -D
```

## Usage

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

#### Load a local file

```ts
optimizer({
  // Support nested module id
  // Support return Promise
  '@scope/name': () => require('fs/promises').readFile('path', 'utf-8'),
})
```

#### Electron and Node.js

```ts
optimizer({
  // Optimize Electron for use ipcRenderer in Renderer-process
  electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer };`,

  // this means that both 'fs' and 'node:fs' are supported
  // e.g. `import fs from 'fs'` or `import fs from 'node:fs'`
  fs: () => ({
    // this is actually `alias.find`
    find: /^(node:)?fs$/,
    code: `const fs = require('fs'); export { fs as default }`;
  }),
})
```

## Advance

#### Optimize an ES module as an CommonJs module for Node.js

Such as [execa](https://www.npmjs.com/package/execa), [node-fetch](https://www.npmjs.com/package/node-fetch), you can see this 👉 [vite-plugin-esmodule](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/esmodule)

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
  /** Generated file cache directory */
  dir: string;
}

export interface ResultDescription {
  alias?: { find: string | RegExp; replacement: string };
  code?: string;
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

## How to work

#### Let's use Vue as an example

```js
optimizer({
  vue: `const vue = window.Vue; export { vue as default }`,
})
```

1. Create `node_modules/.vite-plugin-optimizer/vue.js` and contains the following code

```js
const vue = window.Vue; export { vue as default }
```

2. Register a `vue` alias item and add it to `resolve.alias`

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
 * If you are using a function and have no return value, alias will not be registered.
 * In this case, you must explicitly specify alias.
 * 
 * e.g.
 * 
 * optimizer({
 *   vue(args) {
 *     // You can customize the build "vue" and output it to the specified folder.
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

3. Add `vue` to the `optimizeDeps.exclude` by default.  
  You can avoid it by `optimizeDeps.include`

```js
export default {
  optimizeDeps: {
    exclude: ['vue'],
  },
}
```
