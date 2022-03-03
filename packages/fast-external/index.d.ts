import { Plugin } from 'vite';

export type Externals = Record<string, string | ((args: { dir: string; }) => string | Promise<string>)>;

export interface ExternalOptions {
  /**
   * Whether to insert the external module into "optimizeDeps.exclude"
   * @default true
   */
  optimizeDepsExclude?: boolean;
  /**
   * Absolute path or relative path
   * @default ".vite-plugin-fast-external"
   */
  dir?: string;
}

export interface VitePluginFastExternal {
  (externals: Externals, options?: ExternalOptions): Plugin;
}

/**
 * @example
 * ```js
 * fastExternal({
 *   // Simple example
 *   vue: 'Vue',
 *
 *   // Custom external code by function
 *   '@scope/name': () => `const Lib = window.ScopeName.Member; export default Lib;`,
 *
 *   // Read a template file and return Promise<string>
 *   externalId: async () => await require('fs').promises.readFile('path', 'utf-8'),
 * })
 * ```
 */
declare const fastExternal: VitePluginFastExternal;

export default fastExternal;
