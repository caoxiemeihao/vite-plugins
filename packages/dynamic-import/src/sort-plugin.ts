import type { Plugin } from 'vite'

/**
 * 'vite-plugin-dynamic-import' can only transform JavaScript.  
 * So it should be put behind some known plugins.
 */
export function sortPlugin(vitePlugin: Plugin, pluginNames: string[] = []): Plugin {
  const name = `${vitePlugin.name}:sorter`
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
  const knownNames = Object.values(KNOWN_PLUGINS).flat().concat(pluginNames)

  return {
    name,
    async configResolved(config) {
      await vitePlugin.configResolved?.call(this, config)

      const resolvedNames = config.plugins.map(p => p.name)
      // Find the last known plugin
      const lastIndex = [...resolvedNames].reverse().findIndex(rn => knownNames.includes(rn))
      if (lastIndex > -1) {
        const index = resolvedNames.length - 1 - lastIndex

        // Move it to after known plugins
        // @ts-ignore
        config.plugins.splice(index + 1, 0, vitePlugin)
        // Filter out the plugin itself
        // @ts-ignore
        config.plugins.splice(config.plugins.findIndex(p => p.name === name), 1)
      } else {
        //  Filter out the plugin itself
        // @ts-ignore
        config.plugins.splice(config.plugins.findIndex(p => p.name === name), 1, vitePlugin)
      }
    },
  }
}
