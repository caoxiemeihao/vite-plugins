# vite-plugin-lang-jsx

[![npm package](https://nodei.co/npm/vite-plugin-lang-jsx.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-lang-jsx)

> Automatically add `lang="jsx"` attribute for when using vite-plugin-vue2

[![NPM version](https://img.shields.io/npm/v/vite-plugin-lang-jsx.svg?style=flat)](https://npmjs.org/package/vite-plugin-lang-jsx)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-lang-jsx.svg?style=flat)](https://npmjs.org/package/vite-plugin-lang-jsx)

### Installation

```bash
npm install vite-plugin-lang-jsx --save-dev
```

## Usage

```js
import { createVuePlugin } from 'vite-plugin-vue2'
import langJsx from 'vite-plugin-lang-jsx';

export default defineConfig({
  plugins: [
    createVuePlugin(),
    langJsx(),
  ]
});
```

## Definition

```typescript
export type LangJsx = (options?: {
  /**
   * @default 'jsx'
   */
  lang?: 'jsx' | 'tsx'
}) => import('vite').Plugin
```

## How to work

- Use RegExp to detect JSX tags in script tags of .vue files - eg:

  ```js
  // source code
  <script>
    export default {
      render() {
        return <div>Hello world!</div>;
      },
    }
  </scrpt>

  // transformed
  <script lang="jsx">
    export default {
      render() {
        return <div>Hello world!</div>;
      },
    }
  </scrpt>
  ```
