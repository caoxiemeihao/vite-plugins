import fs from 'fs'
import path from 'path'
import {
  type Plugin,
  type UserConfig,
  normalizePath,
} from 'vite'
import template from 'lodash.template'
import { cleanUrl } from './utils'

// Limitations:
// `ejs` `nunjucks` `handlebars` and other tempaltes must be written in the `.html` file.
// Any other file types will be considered static files by Vite.
// see: https://github.com/vitejs/vite/blob/344642ad630d8658308dbf707ed805cb04b49d58/packages/vite/src/node/server/middlewares/static.ts#L77

export interface Options {
  /** Value of script src */
  inject?: string
  /**
   * Path of [name].html
   * 
   * e.g.
   * - 'public/index.html'
   * - { 'index.html': 'public/index.ejs' }
   */
  template?: string | { [entryAlias: string]: string }
  data?: Record<string, any>

  /** Finally value of `req.url` or entry of Rollup */
  _path?: string
}

export default function viteHtml(options: Options | Options[] = {}): Plugin[] {
  const opts = mappingTemplate(Array.isArray(options) ? options : [options])
  let root: string; const resolveRoot = (config: UserConfig) => {
    // https://github.com/vitejs/vite/blob/cc980b09444f67bdcd07481edf9e0c0de6b9b5bd/packages/vite/src/node/config.ts#L442-L445
    root = config.root ? path.resolve(config.root) : process.cwd()
  }
  const resolvePath = (template: string, prefer: 'short' | 'long') => {
    template = normalizePath(template)
    return prefer === 'long'
      // Rollup input must be absolute path
      ? path.resolve(root, template)
      // For support absolute path on Vite serve
      : ('/' + template.replace(root, ''))
  }
  const records: {
    source: string;
    // Temp entry at build time
    entry: string;
  }[] = []

  const plugin: Plugin = {
    name: 'vite-html-plugin',
    transformIndexHtml: {
      enforce: 'pre',
      transform(html, ctx) {
        const opt = opts.find(opt => opt._path?.endsWith(ctx.path)) || {} as Options

        // Inject js
        if (opt.inject) {
          // TODO: inject js to anywhere
          html = html.replace(
            '</body>',
            `  <script src="${opt.inject}" type="module"></script>\n  </body>`,
          )
        }

        // It's ejs template
        if (html.includes('<%')) {
          html = template(html)(opt.data)
        }

        return html
      }
    },
  }

  return [
    {
      ...plugin,
      apply: 'serve',
      config(conf) {
        resolveRoot(conf)
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          let url = req.url ? cleanUrl(req.url) : ''
          if (url === '/') {
            url = '/index.html'
          }
          const opt = opts.find(opt => opt.template && opt.template[url.slice(1)])
          if (opt) {
            const [, template] = Object.entries(opt.template)[0]
            req.url = resolvePath(template, 'short')

            // Useful in `transformIndexHtml` hook
            opt._path = req.url
          }

          next()
        })
      },
    },
    {
      ...plugin,
      apply: 'build',
      config(conf) {
        resolveRoot(conf)

        if (!conf.build) conf.build = {}
        if (!conf.build.rollupOptions) conf.build.rollupOptions = {}
        if (!conf.build.rollupOptions.input) conf.build.rollupOptions.input = {}

        for (const opt of opts) {
          const [name, template] = Object.entries(opt.template)[0]
          const record = {
            source: resolvePath(template, 'long'),
            entry: path.join(root, name),
          }
          records.push(record)

          // Temporarily copy entries to the root dir.
          fs.writeFileSync(record.entry, fs.readFileSync(record.source))

          // Useful in `transformIndexHtml` hook
          opt._path = record.entry
        }

        let input = conf.build.rollupOptions.input
        if (typeof input === 'string' || Array.isArray(input)) {
          input = records.map(p => p.entry).concat(input)
        } else {
          for (const record of records) {
            Object.assign(input, { [path.basename(record.entry)]: record.entry })
          }
        }
      },
      buildEnd() {
        for (const entry of records) {
          // Remove temporary entries.
          fs.rmSync(entry.entry)
        }
        records.length = 0
      },
    }
  ]
}

function mappingTemplate(
  options: Options[]
): (Omit<Options, 'template'> & {
  template: { [entryAlias: string]: string }
})[] {
  // @ts-ignore
  return options.map(opts => {
    const { template } = opts
    if (typeof template === 'string') {
      const lastIndex = template.lastIndexOf('/')
      const name = lastIndex > -1 ? template.slice(lastIndex + 1) : template
      // Mapping 'public/[name].html' to { '[name].html': 'public/[name].html' }
      opts.template = { [name]: template }
    }
    return opts
  })
}
