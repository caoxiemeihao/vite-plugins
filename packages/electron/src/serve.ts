import type { ChildProcessWithoutNullStreams } from 'child_process'
import { spawn } from 'child_process'
import { AddressInfo } from 'net'
import type { ViteDevServer, UserConfig } from 'vite'
import { build as viteBuild } from 'vite'
import { buildConfig } from './build'
import { mergeConfigRecursively } from './utils'
import type { Configuration } from './types'

export async function bootstrap(config: Configuration, server: ViteDevServer) {
  const electronPath = require('electron')
  const { config: viteConfig } = server

  if (config.preload) {
    const preloadConfig = mergeConfigRecursively(
      buildConfig(config, viteConfig, 'preload'),
      {
        mode: 'development',
        build: {
          watch: true,
        },
        plugins: [{
          name: 'electron-preload-watcher',
          writeBundle() {
            server.ws.send({ type: 'full-reload' })
          },
        }],
      } as UserConfig,
    )
    await viteBuild(mergeConfigRecursively(preloadConfig, config.preload.vite || {}))
  }


  let electronProcess: ChildProcessWithoutNullStreams = null
  const address = server.httpServer.address() as AddressInfo
  const env = Object.assign(process.env, {
    VITE_DEV_SERVER_HOST: address.address,
    VITE_DEV_SERVER_PORT: address.port,
  })

  const mainConfig = mergeConfigRecursively(
    buildConfig(config, viteConfig, 'main'),
    {
      mode: 'development',
      build: {
        watch: true,
      },
      plugins: [{
        name: 'electron-main-watcher',
        writeBundle() {
          electronProcess && electronProcess.kill()
          electronProcess = spawn(electronPath, ['.'], { stdio: 'inherit', env })
        },
      }],
    } as UserConfig,
  )
  await viteBuild(mergeConfigRecursively(mainConfig, config.main.vite || {}))
}
