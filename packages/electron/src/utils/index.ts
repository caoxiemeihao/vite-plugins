import path from 'path'
import type { ResolvedConfig } from 'vite'

export { mergeConfigRecursively } from './merge-config'

export function relativeOutDir(config: ResolvedConfig, paths: string[]) {
  path.relative(
    path.join(config.root, config.build.outDir),
    config.root
  )
  config.root
}
