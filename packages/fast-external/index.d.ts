import { Plugin, UserConfig } from 'vite';

export type External = Record<string, string | (() => string | Promise<string>)>;

export interface VitePluginFastExternal {
  (
    external: External,
    options?: {
      /**
       * @default 'esm'
       * esm will generate code -> const vue = window['Vue']; export { vue as default }
       * cjs will generate code -> const vue = window['Vue']; module.exports = vue;
       */
      format: 'esm' | 'cjs';
      /**
       * @default true
       * Whether to insert the external module into "optimizeDeps.exclude"
       */
      optimizeDepsExclude: boolean;
    },
  ): Plugin;
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

// --------- utils ---------
export interface GenerateExternalFile {
  (
    externalDir: string,
    external: External,
    format: Parameters<VitePluginFastExternal>[1]['format'],
  ): Promise<void>;
}

export interface ModifyAlias {
  (
    config: UserConfig,
    aliaList: { [external: string]: string; }[],
  ): void;
}

export interface ModifyOptimizeDepsExclude {
  (config: UserConfig, exclude: string[]): void;
}
