# vite-plugin-esmodule

[![NPM version](https://img.shields.io/npm/v/vite-plugin-esmodule.svg?style=flat)](https://npmjs.org/package/vite-plugin-esmodule)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-esmodule.svg?style=flat)](https://npmjs.org/package/vite-plugin-esmodule)

Build ES module to CommonJs module for Node.js

English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/esmodule/README.zh-CN.md)

## Why

🤔 When ES module such as [execa](https://www.npmjs.com/package/execa), [node-fetch](https://www.npmjs.com/package/node-fetch), [file-type](https://www.npmjs.com/package/file-type) used in the Node.js project, we should compile them into CommonJs modules to ensure that they can work normally

👉 You can think that this plugin is to solve some NPM Packges released by [sindresorhus](https://www.npmjs.com/~sindresorhus) 😅

🚧 The plugin only work in the `vite build` phase

## Usage

Take execa, node-fetch and file-type as examples

- vite.config.js

```js
import esmodule from 'vite-plugin-esmodule'

export default {
  plugins: [
    esmodule([
      'execa',
      'node-fetch',

      // `file-type` have exports condition in package.json
      // this means that you have explicit specified the entry file
      // 🌱 the purpose of this design is to eliminate the difference between Vite and Webpack
      { 'file-type': 'file-type/index.js' },
    ]),
  ],
}
```

By default, the plugin use Webpack as build tools. You can specify Vite by `options.vite`  

```js
esmodule([...some-es-module], {
  vite: true,
  // or
  vite: (config) => config,
})
```

- execa.js

```js
import {execa} from 'execa';

const {stdout} = await execa('echo', ['unicorns']);
console.log(stdout);
//=> 'unicorns'
```

See the test [cases](https://github.com/caoxiemeihao/vite-plugins/tree/main/playground/vite-plugin-esmodule)

## API

#### esmodule(modules[,options])

modules: ES module name list

```ts
modules: (string | { [module: string]: string })[]
```

options:

```ts
options?: WebpackOptions | ViteOptions

export interface WebpackOptions {
  webpack?: true
    | ((config: Configuration) => Configuration | void | Promise<Configuration | void>);
  vite?: never;
}

export interface ViteOptions {
  vite?: true
    | ((config: UserConfig) => UserConfig | void | Promise<UserConfig | void>);
  webpack?: never;
}
```

## How to work

This plugin just wraps [vite-plugin-optimizer](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/optimizer)
