# vite-plugin-esmodule

[![npm package](https://nodei.co/npm/vite-plugin-esmodule.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-esmodule)
<br/>
[![NPM version](https://img.shields.io/npm/v/vite-plugin-esmodule.svg?style=flat)](https://npmjs.org/package/vite-plugin-esmodule)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-esmodule.svg?style=flat)](https://npmjs.org/package/vite-plugin-esmodule)

Build ES module to CommonJs module for Node.js

English | [简体中文](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/esmodule/README.zh-CN.md)

## Why

When ES module such as [execa](https://www.npmjs.com/package/execa), [node-fetch](https://www.npmjs.com/package/node-fetch), [file-type](https://www.npmjs.com/package/file-type) used in the Node.js project, we should compile them into CommonJs modules to ensure that they can work

## 🚧 Warning

The plugin only work in the  `vite build` phase

The Plugin built NPM Packages use Vite by default, of course you can specify use Webpack by `options.webpack`

If some NPM Packges have problems after being built with vite, please choose to build with `options.webpack`

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
      // file-type have exports condition in package.json
      { 'file-type': 'file-type/index.js' },
    ]),
  ],
}
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
  webpack?: true | ((config: Configuration) => Configuration | void | Promise<Configuration | void>);
  vite: never;
}

export interface ViteOptions {
  vite?: true | ((config: UserConfig) => UserConfig | void | Promise<UserConfig | void>);
  webpack: never;
}
```

## How to work

This plugin just wraps [vite-plugin-optimizer](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/optimizer)
