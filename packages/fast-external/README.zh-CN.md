# vite-plugin-fast-external

[![npm package](https://nodei.co/npm/vite-plugin-fast-external.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-fast-external)
<br/>
[![NPM version](https://img.shields.io/npm/v/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)

🚀 **高性能** 不需要语法转换
🌱 支持自定义 external 代码段

**[English](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/fast-external#readme) | 简体中文**

- 类似 Webpack 的 externals，支持浏览器、Node.js、Electron 等多环境

- 没有使用语法分析，只是通过 resolveId 钩子拦截实现的模块重定向加载，十分高效

- 支持通过函数返回字符串的形式任意定制代码段 -- 十分灵活！🎉

## 安装

```bash
npm i vite-plugin-fast-external -D
```

## 使用

```js
import external from 'vite-plugin-fast-external';

export default defineConfig({
  plugins: [
    external({
      vue: 'Vue',
    })
  ]
})
```

#### 自定义

支持通过 function 返回自定义 external 代码

```js
external({
  'element-ui': () => `
    const E = window.ELEMENT;
    export { E as default };
    export const Loading = E.Loading;
    export const Message = E.Message;
    export const MessageBox = E.MessageBox;
    export const Notification = E.Notification;
  `,
  // ...其他 element-ui 导出成员
})
```

#### 加载文件

支持嵌套模块命名，支持返回 Promise

```ts
resolve({
  'path/filename': () => require('fs/promises').readFile('path', 'utf-8'),
})
```

## API

external(entries)

```ts
type entries = Record<string, string | ((id: string) => string | Promise<string>)>;
```

## 工作原理

实际中，该插件会拦截你的 import 导入，并返回指定的代码段
Let's use `external({ vue: 'Vue' })` as an example, this will get the code snippet  

```js
const M = window['Vue']; export { M as default }
```
