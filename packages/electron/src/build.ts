import type { ResolvedConfig, UserConfig } from 'vite'
import { build as viteBuild } from 'vite'
import { mergeConfigRecursively } from './utils'
import type { Configuration } from './types'

export function buildConfig(
  config: Configuration,
  viteConfig: ResolvedConfig,
  name: 'main' | 'preload'
) {
  return {
    build: {
      outDir: `${viteConfig.build.outDir}/electron-${name}`,
      lib: {
        entry: config[name].entry,
        formats: ['cjs'],
        fileName: () => '[name].js',
      },
    },
  } as UserConfig
}

export async function build(config: Configuration, viteConfig: ResolvedConfig) {
  if (config.preload) {
    const preloadConfig = buildConfig(config, viteConfig, 'preload')
    await viteBuild(mergeConfigRecursively(preloadConfig, config.preload.vite || {}))
  }

  const mainConfig = buildConfig(config, viteConfig, 'main')
  await viteBuild(mergeConfigRecursively(mainConfig, config.main.vite || {}))
}
