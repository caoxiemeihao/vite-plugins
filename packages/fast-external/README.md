# vite-plugin-fast-external

[![npm package](https://nodei.co/npm/vite-plugin-fast-external.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-fast-external)

> Tiny and fast vite external plugin, without lexical transform.

[![NPM version](https://img.shields.io/npm/v/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)

### Installation

```bash
npm install vite-plugin-fast-external --save-dev
```

## Usage

```js
import fastExternal from 'vite-plugin-fast-external';

export default defineConfig({
  plugins: [
    fastExternal({
      vue: 'Vue',
    })
  ]
});
```

## Definition

```typescript
export type fastExternal = (
  externals: Record<string, string>,
  options?: {
    /**
     * @default 'esm'
     * esm will generate code - const vue = window['Vue']; export { vue as default };
     * cjs will generate code - const vue = window['Vue']; module.exports = vue;
     */
    format: 'esm' | 'cjs'
  },
) => VitePlugin
```

## How to work

- Generate ESModule code into `node_modules/.vite-plugin-fast-external/xxxx.js` - eg:

  ```js
  // source code
  import Vue from 'vue'
  // transformed
  const vue = window['Vue']; export { vue as default }
  ```

- `node_modules/.vite-plugin-fast-external/xxxx.js` will be return when vite load hooks - eg:

  ```js
  {
    name: 'vite-plugin-fast-external',
    load(id) {
      if (id.includes('node_modules/.vite-plugin-fast-external')) {
        return fs.readFileSync(externalFilename, 'utf8')
      }
    },
  },
  ```

## TODO

- [ ] Support multiple member import, such as `import { ref, watch } from '@vue/composition-api'`
