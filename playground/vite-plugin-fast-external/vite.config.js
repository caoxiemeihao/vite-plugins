import path from 'path'
import { defineConfig } from 'vite';
import external from '../../packages/fast-external';
import { vue_v3, pinia_v2, lib2external } from '../../packages/fast-external/presets';

export default defineConfig({
  plugins: [
    external({
      '@angular/core': () => `const Angular = { version: '13.3.0' }; export default Angular;`,
      vue: vue_v3,
      pinia: pinia_v2,
      'vue-router': lib2external('VueRouter', [
        'NavigationFailureType',
        'RouterLink',
        'RouterView',
        'START_LOCATION',
        'createMemoryHistory',
        'createRouter',
        'createRouterMatcher',
        'createWebHashHistory',
        'createWebHistory',
        'isNavigationFailure',
        'matchedRouteKey',
        'onBeforeRouteLeave',
        'onBeforeRouteUpdate',
        'parseQuery',
        'routeLocationKey',
        'routerKey',
        'routerViewLocationKey',
        'stringifyQuery',
        'useLink',
        'useRoute',
        'useRouter',
        'viewDepthKey',
      ]),
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        index: path.join(__dirname, 'index.html'),
        react: path.join(__dirname, 'react.html'),
      }
    }
  }
});
