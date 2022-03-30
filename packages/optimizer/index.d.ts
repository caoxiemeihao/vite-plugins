import { Alias, Plugin, UserConfig } from 'vite';

declare const optimizer: VitePluginOptimizer;
export default optimizer;

export interface OptimizerArgs {
  /** Generated file cache directory */
  dir: string;
}

export interface ResultDescription {
  /**
   * this option is designed to fully support `alias`  
   * this is useful if users want to customize alias  
   * ```js
   * {
   *   // e.g. 👉 `/^(node:)?fs$/` from user customization  
   *   find: /^(node:)?fs$/,
   *   replacement: '/project/node_modules/.vite-plugin-optimizer/fs.js',
   * }
   * ```
   */
  alias?: {
    find: string | RegExp;
    /**
     * If not specified, the path of the generated file is used.
     */
    replacement?: string;
  };
  code?: string;
}

export interface Entries {
  [moduleId: string]:
  | string
  | ResultDescription
  | ((args: OptimizerArgs) => string | ResultDescription | Promise<string | ResultDescription | void> | void)
  | void;
}

export interface OptimizerOptions {
  /**
   * @default ".vite-plugin-optimizer"
   */
  dir?: string;
  /**
   * @default ".js"
   */
  ext?: string;
}

export interface VitePluginOptimizer {
  (entries: Entries, options?: OptimizerOptions): Plugin;
}

// --------- utils ---------

export type GenerateRecord = {
  alias?: ResultDescription['alias'];
  module: string;
  // absolute path of file
  filepath: string;
};
export interface GenerateModule {
  (dir: string, entries: Entries, ext: string): Promise<GenerateRecord[]>;
}

export interface RegisterAlias {
  (
    config: UserConfig,
    records: GenerateRecord[],
  ): void;
}

export interface RegisterOptimizeDepsExclude {
  (config: UserConfig, exclude: string[]): void;
}
