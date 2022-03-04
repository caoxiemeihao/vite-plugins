# vite-plugin-resolve

[![NPM version](https://img.shields.io/npm/v/vite-plugin-resolve.svg)](https://npmjs.org/package/vite-plugin-resolve)
[![NPM Downloads](https://img.shields.io/npm/dw/vite-plugin-resolve.svg)](https://npmjs.org/package/vite-plugin-resolve)

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
import { defineConfig } from 'vite'
import resolve from 'vite-plugin-resolve'

export default defineConfig({
  plugins: [
    resolve({
      // Resolve custom module content
      // This like Vite external plugin
      vue: `const vue = window.Vue; export { vue as default }`,
    }),
  ]
})
```

#### Read a local file

```ts
resolve({
  // Supported nested moduleId
  // Supported return an Promis<string>
  '@scope/name': async () => await require('fs').promises.readFile('path', 'utf-8'),
})
```

#### Electron

```ts
resolve({
  // Resolve Electron ipcRenderer in Renderer-process
  electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer };`,
})
```

#### Resolve an ES module as an CommonJs module for Node.js

**Such as [execa](https://www.npmjs.com/package/execa), [node-fetch](https://www.npmjs.com/package/node-fetch)**

```ts
import { builtinModules } from 'module'
import { defineConfig, build } from 'vite'
import resolve from 'vite-plugin-resolve'

export default defineConfig({
  plugins: [
    resolve({
      async execa(args) {
        // Build execa as an CommonJs module
        await build({
          plugins: [
            {
              name: 'vite-plugin[node:mod-to-mod]',
              enforce: 'pre',
              // Replace `import fs from "node:fs"` with `import fs from "fs"`
              resolveId(source) {
                if (source.startsWith('node:')) {
                  return source.replace('node:', '')
                }
              },
            }
          ],

          // Build execa.js into cache directory
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
  /** Generated file cache directory */
  dir: string;
}
```

##### options

```ts
export interface ResolveOptions {
  /**
   * Absolute path or relative path
   * @default ".vite-plugin-resolve"
   */
  dir: string;
}
```

## How to work

#### Let's use Vue as an example

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

3. Add `vue` to the `optimizeDeps.exclude` by default.  
  You can avoid it through `optimizeDeps.include`

```js
export default {
  optimizeDeps: {
    exclude: ['vue'],
  },
}
```
