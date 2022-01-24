
/**
 * Custom resolve code for vite
 * 
 * @example 
 * export default defineConfig({
 *   plugins: [
 *     viteResolve({
 *       // use code string
 *       vue: `const vue = window.Vue; export default vue;`,
 *       // use nested module name, return code string through function
 *       '@scope/name': () => `const Lib = window.LibraryName; export default Lib;`,
 *       // use in electron
 *       'electron': `const Electron = require('electron'); export default Electron;`,
 *     })
 *   ]
 * })
 */
declare function resolve(
  resolves: Record<string, string | (() => string)>
): import('vite').Plugin

export default resolve
