# vite-plugin-fast-external

[![npm package](https://nodei.co/npm/vite-plugin-fast-external.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-fast-external)
<br/>
[![NPM version](https://img.shields.io/npm/v/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)

不使用语法转换, 支持自定义 external 代码段

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
      // 基本使用
      // 默认会生成 const Vue = window['Vue']; export { Vue as default }
      vue: 'Vue',

      // 支持包命名空间，通过函数可以自定义返回任何代码段 - 但你要知道 vite 开发期只支持 ESM
      '@namespace/lib-name': () => `
        const lib = window.LibName;
        export default lib;
        export const Message = lib.Message
        export const Notification = lib.Notification;
      `,

      // 还支持返回 Promise<string> 很容易配合文件、网络等 IO
      externalId: () => require('fs/promises').readFile('path', 'utf-8'),

      // 在 Electron 渲染进程中使用
      electron: () => `const { ipcRenderer } = require('electron'); export { ipcRenderer }`,
    })
  ]
})
```

## API

### external(entries)

**entries**

```ts
Record<string, string | ((id: string) => string | Promise<string>)>;
```
