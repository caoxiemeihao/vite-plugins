# vite-plugin-dynamic-import
An vite plugin for dynamic import


## Usage
```javascript
import { dynamicImport } from 'vite-plugin-dynamic-import'

export default {
  plugins: [
    dynamicImport()
  ]
}
```

## How and why?

- In my project has below code

  ```javascript
  const constantRouterMap = [];
  const format = (x) => {
    const route = {
      path: x.path,
      icon: x.icon || 'setting',
      name: x.path,
      component: () => import(`@/views${x.component || x.path}`),
      hidden: x.hidden,
      meta: {
        desc: x.desc,
        actionId: x.actionId || 'ALL',
        breadcrumb: x.breadcrumb,
      },
    };
    if (!x.children || x.children.length === 0) {
      constantRouterMap.push(route);
    } else {
      x.children.forEach(format);
    }
  };
  ```

- It's got a warning in vite

  ```bash
  2:03:22 PM [vite] warning: 
  /Users/atom/Desktop/hello/AppAccountPlatformWeb-mm/base/router/index.js
  21 |      icon: x.icon || 'setting',
  22 |      name: x.path,
  23 |      component: () => import(`@/views${x.component || x.path}`),
    |                              ^
  24 |      hidden: x.hidden,
  25 |      meta: {
  The above dynamic import cannot be analyzed by vite.
  See https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations for supported dynamic import formats. If this is intended to be left as-is, you can use the /* @vite-ignore */ comment inside the import() call to suppress this warning.

    Plugin: vite:import-analysis
    File: /Users/atom/Desktop/hello/AppAccountPlatformWeb-mm/base/router/index.js
  ```

## The plugin try fix the warning
- supported `alias`

  * original code
  ```javascript
  import(`@/views${x.component || x.path}`)
  ```

  * alias will be replaced
  ```javascript
  // "../" is calculated based on the alias path
  import(`../views${x.component || x.path}`)
  ```

- list all the possibilities

  * after replacing alias code
  ```javascript
  import(`../views${x.component || x.path}`)
  ```

  * will be transformed
  ```javascript
  __variableDynamicImportRuntime0__(`../views${x.component || x.path}`)

  // other codes...

  function __variableDynamicImportRuntime0__(path) {
    switch (path) {
      case '../views/foo': return import('../views/foo/index.vue');
      case '../views/foo/index': return import('../views/foo/index.vue');
      case '../views/foo/index.vue': return import('../views/foo/index.vue');
      default: return new Promise(function(resolve, reject) {
        (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(
          reject.bind(null, new Error("Unknown variable dynamic import: " + path))
        );
      });
    }
  }
  ```

