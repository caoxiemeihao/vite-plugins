import { Plugin, UserConfig } from 'vite';

declare const optimizer: VitePluginOptimizer;
export default optimizer;

export interface OptimizerArgs {
  /** Generated file cache directory */
  dir: string;
}

export interface Entries {
  [moduleId: string]:
    | string
    | ((args: OptimizerArgs) => string | void | Promise<string | void>)
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
export interface GenerateModule {
  (dir: string, entries: Entries, ext: string): Promise<void>;
}

export interface RegisterAlias {
  (
    config: UserConfig,
    alias: Alias[],
  ): void;
}

export interface RegisterOptimizeDepsExclude {
  (config: UserConfig, exclude: string[]): string[];
}
