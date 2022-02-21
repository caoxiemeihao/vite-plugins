[![npm package](https://nodei.co/npm/vite-plugin-commonjs.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-commonjs)

A pure JavaScript implementation of vite-plugin-commonjs

English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/commonjs/README.zh-CN.md)

[![NPM version](https://img.shields.io/npm/v/vite-plugin-commonjs.svg?style=flat)](https://npmjs.org/package/vite-plugin-commonjs)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-commonjs.svg?style=flat)](https://npmjs.org/package/vite-plugin-commonjs)


- Only work in the  `vite serve` phase
- Only dependency `acorn` and `acorn-walk`

### Usage

**🚧 The plugin can only transform JavaScript. So it should be placed behind other plug-ins, such as `@vitejs/plugin-vue` `@vitejs/plugin-react` `vite-plugin-vue2`**

```js
import vue from '@vitejs/plugin-vue'
import { vitePluginCommonjs } from 'vite-plugin-commonjs'

export default {
  plugins: [
    vue(),
    vitePluginCommonjs()
  ]
}
```
