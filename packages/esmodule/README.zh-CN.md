# vite-plugin-esmodule

[![npm package](https://nodei.co/npm/vite-plugin-esmodule.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-plugin-esmodule)
<br/>
[![NPM version](https://img.shields.io/npm/v/vite-plugin-esmodule.svg?style=flat)](https://npmjs.org/package/vite-plugin-esmodule)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-esmodule.svg?style=flat)](https://npmjs.org/package/vite-plugin-esmodule)

将 ESM 转换成 CommonJs 以提供 Node.js 使用

[English](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/esmodule#readme) | 简体中文

## 此为何物

🤔 在 Node.js 项目中使用一些纯 ES module 比如 [execa](https://www.npmjs.com/package/execa), [node-fetch](https://www.npmjs.com/package/node-fetch), [file-type](https://www.npmjs.com/package/file-type), 需要将它们编译成 CommonJs 格式才能正常工作

👉 你姑且可以认为这个插件是为了解决这哥们儿 [sindresorhus](https://www.npmjs.com/~sindresorhus) 发布的 NPM Packges 😅

🚧 该插件只在 `vite build` 阶段起作用

## 来玩玩吧

随手举几个 ES module 的 🌰 -> execa, node-fetch and file-type

- vite.config.js

```js
import esmodule from 'vite-plugin-esmodule'

export default {
  plugins: [
    esmodule([
      'execa',

      // 在 file-type 的 package.json 中有 exports 条件导出
      // 这里表示你可以显示的指定你要以哪个文件作为入口
      // 🌱 这样设计的目的是为了抹平 Vite 和 Webpack 之间的差异
      { 'file-type': 'file-type/index.js' },
      // 当使用 Webpack 并设置了 target: 'node' 的时候，Webpack 会自动以 exports.node 为入口
      // 也就是说这里使用 'filt-type' 字符串也是可行的
      // 但是 Vite 总是优先使用 exports.browser 字段作为入口
      // 🙉 在 Webpack 下这样写也可行
      // 'filt-type',
    ]),
  ],
}
```

默认情况下, 该插件使用 Webpack 作为构建工具. 你也可以通过 `options.vite` 指定使用 Vite  

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

你也可以看看其他 [案例](https://github.com/caoxiemeihao/vite-plugins/tree/main/playground/vite-plugin-esmodule)

## API

#### esmodule(modules[,options])

modules: ES module 列表

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

## 咋实现的

只是 [vite-plugin-optimizer](https://github.com/caoxiemeihao/vite-plugins/tree/main/packages/optimizer) 的二次封装而已
