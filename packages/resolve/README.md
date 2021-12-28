# vite-plugin-resolve

[![npm package](https://nodei.co/npm/vite-plugin-resolve.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-resolve)
<br/>
[![NPM version](https://img.shields.io/npm/v/vite-plugin-resolve.svg?style=flat)](https://npmjs.org/package/vite-plugin-resolve)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-resolve.svg?style=flat)](https://npmjs.org/package/vite-plugin-resolve)

### Install

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
      // use string in web
      vue: `const vue = window.Vue; export default vue;`,
      // use function to return string in electron
      'electron-store': () => `const Store = require('electron-store'); export default Store;`,
    })
  ]
})
```
