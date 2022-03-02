# vite-plugin-resolve

[![npm package](https://nodei.co/npm/vite-plugin-resolve.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-resolve)
<br/>
[![NPM version](https://img.shields.io/npm/v/vite-plugin-resolve.svg?style=flat)](https://npmjs.org/package/vite-plugin-resolve)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-resolve.svg?style=flat)](https://npmjs.org/package/vite-plugin-resolve)

Custom resolve module content

**English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/resolve/README.zh-CN.md)**

- It can be compatible with Browser, Node.js and Electron
- You can think of it as an enhanced Vite external plugin
- You can think of it as manually [Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html)

## Install

```bash
npm i vite-plugin-resolve -D
```

## Usage

```ts
// vite.config.ts

import { builtinModules } from 'module'
import { defineConfig, build } from 'vite'
import resolve from 'vite-plugin-resolve'

export default defineConfig({
  plugins: [
    resolve({
      // Resolve external module, this like Vite external plugin
      vue: `const vue = window.Vue; export { vue as default }`,

      // Supported nested moduleId and return an Promis<string>
      '@scope/name': async () => await require('fs').promises.readFile('path', 'utf-8'),

      // Resolve Electron ipcRenderer
      electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer };`,

      // Resolve Node.js ES Module as CommonJs Module. Such as execa, node-fetch
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
  /** Generated file cache directory */
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
   * Whether to insert the external module into "optimizeDeps.exclude"
   * @default true
   */
  optimizeDepsExclude: boolean;
  /**
   * Absolute path or relative path
   * @default ".vite-plugin-resolve"
   */
  dir: string;
}
```

## How to work

**Let's use Vue as an example**

```js
resolve({
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