import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: '/home' },
    { path: '/foo' },
    { path: '/bar' },
  ].map(e => ({
    path: e.path,
    component: () => import(`@/views${e.component || e.path}`),
    // component: () => import('@/views' + (e.component || e.path)),
  })),
})
