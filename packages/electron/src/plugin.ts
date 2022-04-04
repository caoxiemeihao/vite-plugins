import type { Plugin } from 'vite'
import { Configuration } from './types'
import { bootstrap } from './serve'
import { build } from './build'

export const NAME = 'vite-plugin-electron'

export function electron(config: Configuration): Plugin[] {

  return [
    {
      name: `${NAME}:serve`,
      apply: 'serve',
      configureServer(server) {
        server.printUrls = function () {
          server.printUrls()
          bootstrap(config, server)
        }
      },
    },
    {
      name: `${NAME}:build`,
      apply: 'build',
      async configResolved(viteConfig) {
        await build(config, viteConfig)
      },
    },
  ]
}
