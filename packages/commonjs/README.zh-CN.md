[![npm package](https://nodei.co/npm/vite-plugin-commonjs.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-commonjs)

一个纯 JavaScript 实现的 vite-plugin-commonjs

[English](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/commonjs#readme) | 简体中文

[![NPM version](https://img.shields.io/npm/v/vite-plugin-commonjs.svg?style=flat)](https://npmjs.org/package/vite-plugin-commonjs)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-commonjs.svg?style=flat)](https://npmjs.org/package/vite-plugin-commonjs)

## 📢

- 只在 `vite serve` 阶段起作用
- 在 `vite serve` 阶段 CommonJs 语法由内置的 @rollup/plugin-commonjs 处理

## 使用

**🚧 该插件只转换 JavaScript. 所以它应该放在一些插件的后面, 比如 `@vitejs/plugin-vue` `@vitejs/plugin-react` `vite-plugin-vue2`**

```js
import vue from '@vitejs/plugin-vue'
import { commonjs } from 'vite-plugin-commonjs'

export default {
  plugins: [
    vue(),
    commonjs(),
  ]
}
```
