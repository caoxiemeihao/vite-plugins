import type { Plugin } from 'vite'

export const OfficialPlugins = {
  '@vitejs/plugin-vue': 'vite:vue',
  'vite-plugin-vue2': 'vite-plugin-vue2',
  '@vitejs/plugin-vue-jsx': 'vite:vue-jsx',
  '@sveltejs/vite-plugin-svelte': 'vite-plugin-svelte',
  '@vitejs/plugin-react': [
    'vite:react-babel',
    'vite:react-refresh',
    'vite:react-jsx',
  ],
}

export interface SortPluginOptions {
  plugin: Plugin
  names: string[]
  enforce: Plugin['enforce']
}

/**
 * Some plugins must run after others
 */
export function sortPlugin(options: SortPluginOptions): Plugin {
  const { plugin, names, enforce } = options
  const name = `${plugin.name}:sorter`

  return {
    ...plugin,
    name,

    // enforce: plugin.enforce,
    // // This may only run in the `vite build`
    // async options(options) {
    //   return await plugin.options?.call(this, options)
    // },
    // async config(config) {
    //   return await plugin.config?.call(this, config)
    // },

    async configResolved(config) {
      await plugin.configResolved?.call(this, config)

      const resolvedNames = config.plugins.map(p => p.name)
      let isFound = false

      if (enforce === 'pre') {
        const index = resolvedNames.findIndex(rn => names.includes(rn))
        if (index > -1) {
          isFound = true
          // Move it to before known plugin
          // @ts-ignore
          config.plugins.splice(index, 0, plugin)
        }
      } else {
        // Find the last known plugin
        const lastIndex = [...resolvedNames].reverse().findIndex(rn => names.includes(rn))
        if (lastIndex > -1) {
          isFound = true
          const index = resolvedNames.length - 1 - lastIndex
          // Move it to after known plugin
          // @ts-ignore
          config.plugins.splice(index + 1, 0, plugin)
        }
      }

      // Filter out the plugin itself
      const selfIndex = config.plugins.findIndex(p => p.name === name)
      if (isFound) {
        // @ts-ignore
        config.plugins.splice(selfIndex, 1)
      } else {
        // @ts-ignore
        config.plugins.splice(selfIndex, 1, plugin)
      }
    },
  }
}
