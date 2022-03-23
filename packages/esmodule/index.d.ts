import type { Plugin, UserConfig } from 'vite';
import type { Configuration } from 'webpack';

export default esmodule;
declare const esmodule: Esmodule;

export interface WebpackOptions {
  webpack?: true
    | ((config: Configuration) => Configuration | void | Promise<Configuration | void>);
  vite?: never;
}

export interface ViteOptions {
  vite?: true
    | ((config: UserConfig) => UserConfig | void | Promise<UserConfig | void>);
  webpack?: never;
}

export interface Esmodule {
  (
    modules: (string | { [module: string]: string })[],
    options?: WebpackOptions | ViteOptions,
  ): Plugin[];
}
