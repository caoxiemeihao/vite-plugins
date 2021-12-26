
/**
 * Custo  m resolve code for vite
 * @type {(external: Record<string, string | () => string>) => import('vite').Plugin}
 * @example
 * export default defineConfig({
 *   plugins: [
 *     viteResolve({
 *       // use string
 *       vue: `const vue = window.Vue; export default vue;`,
 *       // use function to return string
 *       vuex: () => `const vuex = window.Vuex; export default Vuex;`,
 *     })
 *   ]
 * })
 */
function viteResolve(external = {}) {
  return {
    name: 'vite-plugin-resolve',
    enforce: 'pre',
    resolveId(id) {
      if (external[id]) {
        return id
      }
    },
    load(id) {
      if (external[id]) {
        return typeof external[id] === 'function' ? external[id]() : external[id]
      }
    },
  }
}

module.exports = viteResolve
