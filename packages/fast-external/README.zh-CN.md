# vite-plugin-fast-external

[![npm package](https://nodei.co/npm/vite-plugin-fast-external.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-fast-external)

[![NPM version](https://img.shields.io/npm/v/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-fast-external.svg?style=flat)](https://npmjs.org/package/vite-plugin-fast-external)

> 不使用语法转换, 支持自定义 external 代码段

- 类似 webpack 的 externals，支持浏览器、Node.js、Electron 等多环境 -- 环境无关

- 本质上是通过 `resolve.alias` 实现的模块重定向加载

- 默认使用的 window 作为宿主对象，你也可以通过函数返回字符串的形式任意定制代码段 -- 十分灵活！🎉

**比如：**

```js
fastExternal({
  // 默认会生成 const Vue = window['Vue']; export { Vue as default }
  vue: 'Vue',

  // 自定义 external 代码段在 Node.js 中使用
  nodeJsModule: () => `module.exports = require('模块ID');`,
})
```

## 安装

```bash
npm i -D vite-plugin-fast-external
```

## 使用

```js
import fastExternal from 'vite-plugin-fast-external';

export default defineConfig({
  plugins: [
    fastExternal({
      // 基本使用
      vue: 'Vue',

      // 支持包命名空间，通过函数可以自定义返回任何代码段 - 但你要知道 vite 开发期只支持 ESM
      '@scope/name': () => `const Lib = window.ScopeName.Member; export default Lib;`,

      // 还支持返回 Promise<string> 很容易配合文件、网络等 IO
      externalId: async () => await require('fs').promises.readFile('path', 'utf-8'),
    })
  ]
})
```

## 类型定义

```ts
export type fastExternal = (
  external: Record<string, string | (() => string | Promise<string>)>,
  options?: {
    /**
     * @default 'esm'
     * esm 格式会生成 -> const vue = window['Vue']; export { vue as default }
     * cjs 格式会生成 -> const vue = window['Vue']; module.exports = vue;
     */
    format: 'esm' | 'cjs'
    /**
     * @default true
     * 是否要把 external 插入到 "optimizeDeps.exclude" 中，这样能避开 vite 的预构建
     */
    optimize: boolean
  }
) => VitePlugin
```

## 工作原理

1. external 在 vite 启动时会将代码段生成到对应的文件，比如 `node_modules/.vite-plugin-fast-external/vue.js`
2. 并且在 `resolve.alias` 插入 external 和生成文件的对应配置

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
