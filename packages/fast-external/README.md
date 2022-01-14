# vite-plugin-fast-external

[![npm package](https://nodei.co/npm/vite-plugin-fast-external.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-fast-external)

> Tiny and fast vite external plugin, without lexical transform.

[![NPM version](https://img.shields.io/npm/v/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)

### Installation

```bash
npm i -D vite-plugin-fast-external
```

## Usage

```js
import fastExternal from 'vite-plugin-fast-external';

export default defineConfig({
  plugins: [
    fastExternal({
      // use string
      // will generate code `const vue = window['Vue']; export { vue as default }`
      vue: 'Vue',
      // custom external code by function
      '@scope/name': () => `const Lib = window.LibraryName; export default Lib;`,
    })
  ]
})
```

## Options define

```typescript
export type fastExternal = (
  externals: Record<string, string | (() => string)>,
  options?: {
    /**
     * @default 'esm'
     * esm will generate code - const vue = window['Vue']; export { vue as default }
     * cjs will generate code - const vue = window['Vue']; module.exports = vue;
     */
    format: 'esm' | 'cjs'
  },
) => VitePlugin
```

## How to work

1. External-module will be generated code into `node_modules/.vite-plugin-fast-external/xxxx.js`
2. Append an external-module alias

  ```js
  {
    resolve: {
      alias: [
        {
          find: 'vue',
          replacement: 'User/work-directory/node_modules/.vite-plugin-fast-external/vue.js',
        },
      ],
    },
  }
  ```
