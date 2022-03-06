[![npm package](https://nodei.co/npm/vite-plugin-esmodule.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-esmodule)

Build ES module to CommonJs module for Node.js

English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/esmodule/README.zh-CN.md)

[![NPM version](https://img.shields.io/npm/v/vite-plugin-esmodule.svg?style=flat)](https://npmjs.org/package/vite-plugin-esmodule)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-esmodule.svg?style=flat)](https://npmjs.org/package/vite-plugin-esmodule)

## Why

When ES module such as [execa](https://www.npmjs.com/package/execa), [node-fetch](https://www.npmjs.com/package/node-fetch) used in the Node.js project, we should compile them into CommonJs modules to ensure that they can work

**📢 The plugin only work in the  `vite build` phase**

## Usage

```js
import esmodule from 'vite-plugin-esmodule'

export default {
  plugins: [
    esmodule([
      'execa',
      'node-fetch',
    ]),
  ],
}
```
