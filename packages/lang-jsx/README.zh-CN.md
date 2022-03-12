# vite-plugin-lang-jsx

[![npm package](https://nodei.co/npm/vite-plugin-lang-jsx.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-lang-jsx)
<br/>
[![NPM version](https://img.shields.io/npm/v/vite-plugin-lang-jsx.svg?style=flat)](https://npmjs.org/package/vite-plugin-lang-jsx)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-lang-jsx.svg?style=flat)](https://npmjs.org/package/vite-plugin-lang-jsx)

在使用 vite-plugin-vue2 时自动添加 lang="jsx" 到 `<script>` 标签上

**[English](https://github.com/caoxiemeihao/vite-plugins/blob/main/packages/lang-jsx#readme) | 简体中文**

## 意义

当我们将 @vue/cli 创建的 Vue2.x 项目升级到 Vite 时，会用到 vite-plugin-vue2 插件  
但是 vue-plugin-vue2 插件不能自动处理 `<script>` 标签中的 jsx 语法  
所有需要添加 lang=jsx 到 `<script>` 标签上，以保证语法正常解析  
比如 `<script lang="jsx">`  

## 安装

```bash
npm i -D vite-plugin-lang-jsx
```

## 使用

**🚧 该插件应该放到 `vite-plugin-vue2` 前面**

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

## 定义

```typescript
export type LangJsx = (options?: {
  /**
   * @default 'jsx'
   */
  lang?: 'jsx' | 'tsx'
}) => import('vite').Plugin
```

## 原理

```js
// 源代码
<script>
  export default {
    render() {
      return <div>Hello world!</div>;
    },
  }
</script>

// 转换后代码
<script lang="jsx">
  export default {
    render() {
      return <div>Hello world!</div>;
    },
  }
</script>
```
