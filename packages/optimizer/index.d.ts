import { Alias, Plugin, UserConfig } from 'vite';

declare const optimizer: VitePluginOptimizer;
export default optimizer;

export interface OptimizerArgs {
  /** Generated file cache directory */
  dir: string;
}

export interface ResultDescription {
  // currently only find is supported
  // this option is designed to fully support `alias.find`
  // this is useful if users want to customize find
  // e.g. 👉 `/^(node:)?fs$/` from user customization
  // {
  //   find: /^(node:)?fs$/,
  //   replacement: '/project/node_modules/.vite-plugin-optimizer/fs.js',
  // }
  find?: Pick<Alias, 'find'>;
  code: string;
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
  find?: ResultDescription['find'];
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
