
/**
 * @example
 * export default defineConfig({
 *   plugins: [
 *     fastExternal({
 *       // will generate code `const vue = window['Vue']; export { vue as default }`
 *       vue: 'Vue',
 *       // custom external code by function
 *       '@scope/name': () => `const Lib = window.LibraryName; export default Lib;`,
 *     })
 *   ]
 * })
 */
declare function fastExternal(
  externals: Record<string, string | (() => string)>,
  options?: {
    /**
     * @default 'esm'
     * esm will generate code -> const vue = window['Vue']; export { vue as default }
     * cjs will generate code -> const vue = window['Vue']; module.exports = vue;
     */
    format: 'esm' | 'cjs'
  }
): import('vite').Plugin

export default fastExternal
