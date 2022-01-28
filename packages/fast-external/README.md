# vite-plugin-fast-external

[![npm package](https://nodei.co/npm/vite-plugin-fast-external.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-fast-external)

[![NPM version](https://img.shields.io/npm/v/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)

Without lexical transform, support custom external code

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
      // Simple example
      vue: 'Vue',

      // Custom external code by function
      '@scope/name': () => `const Lib = window.ScopeName.Member; export default Lib;`,

      // Read a template file and return Promise<string>
      externalId: async () => await require('fs').promises.readFile('path', 'utf-8'),
    })
  ]
})
```

## Options define

```typescript
export type fastExternal = (
  externals: Record<string, string | (() => string | Promise<string>)>,
  options?: {
    /**
     * @default 'esm'
     * esm will generate code -> const vue = window['Vue']; export { vue as default }
     * cjs will generate code -> const vue = window['Vue']; module.exports = vue;
     */
    format: 'esm' | 'cjs'
    /**
     * @default true
     * Whether to insert the external module into "optimizeDeps.exclude"
     */
    optimize: boolean
  }
) => VitePlugin
```

## How to work

1. External-module will be generated code into `node_modules/.vite-plugin-fast-external/vue.js`
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
