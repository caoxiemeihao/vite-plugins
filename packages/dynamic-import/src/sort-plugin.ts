import type {
  UserConfig,
  Plugin,
} from 'vite'

/**
 * 'vite-plugin-dynamic-import' can only transform JavaScript.  
 * So it should be put behind some known plugins.
 */
 export function sortPlugin(toSortPlugin: string, config: UserConfig): UserConfig {
  const KNOWN_PLUGINS = {
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

  const plugins = [...config.plugins] as Plugin[]
  const knownNames = Object.values(KNOWN_PLUGINS).flat()
  const pluginNames = plugins.map(plugin => plugin.name)

  // Find the last known plugin
  let orderIndex = [...pluginNames].reverse().findIndex(name => knownNames.includes(name))

  if (orderIndex !== -1) {
    // In the correct position in the array
    orderIndex = pluginNames.length - 1 - orderIndex

    const pluginIndex = pluginNames.findIndex(name => name === toSortPlugin)
    if (pluginIndex < orderIndex) {
      // It is located before a known plugin
      // Move it to after known plugins
      plugins.splice(orderIndex, 0, plugins.splice(pluginIndex, 1)[0])
    }
    config.plugins = plugins
    return config
  }
}
