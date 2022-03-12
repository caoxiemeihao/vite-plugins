# vite-plugin-lang-jsx

[![npm package](https://nodei.co/npm/vite-plugin-lang-jsx.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-lang-jsx)
<br/>
[![NPM version](https://img.shields.io/npm/v/vite-plugin-lang-jsx.svg?style=flat)](https://npmjs.org/package/vite-plugin-lang-jsx)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-lang-jsx.svg?style=flat)](https://npmjs.org/package/vite-plugin-lang-jsx)

Automatically add `lang="jsx"` to `<script>` tag when using `vite-plugin-vue2`

**English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/lang-jsx/README.zh-CN.md)**
## Why

When we upgrade the Vue2.x proejct created by `@vue/cli` to Vite, we will use `vue-plugin-vue2`.  
However, `vue-plugin-vue2` does not automatically handle the `jsx` syntax in `<script>`.  
So we need to add `lang=jsx` above `<script>` to ensure its worked.  
Like `<script lang="jsx">`.  

## Installation

```bash
npm i -D vite-plugin-lang-jsx
```

## Usage

**🚧 The plugin should be placed before `vite-plugin-vue2`**

```js
import { defineConfig } from 'vite';
import langJsx from 'vite-plugin-lang-jsx';
import { createVuePlugin } from 'vite-plugin-vue2'

export default defineConfig({
  plugins: [
    langJsx(),
    createVuePlugin(),
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

```js
// source code
<script>
  export default {
    render() {
      return <div>Hello world!</div>;
    },
  }
</script>

// transformed
<script lang="jsx">
  export default {
    render() {
      return <div>Hello world!</div>;
    },
  }
</script>
```
