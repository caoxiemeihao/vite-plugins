import fs from 'fs'
import path from 'path'
import {
  type Plugin,
  type UserConfig,
  type IndexHtmlTransformContext,
  normalizePath,
} from 'vite'
import lodashTemplate from 'lodash.template'
import { cleanUrl } from './utils'

// Limitations:
// `ejs` `nunjucks` `handlebars` and other tempaltes must be written in the `.html` file.
// Any other file types will be considered static files by Vite.
// see: https://github.com/vitejs/vite/blob/344642ad630d8658308dbf707ed805cb04b49d58/packages/vite/src/node/server/middlewares/static.ts#L77

export interface Options {
  /** Value of script src */
  inject?: string
  /**
   * e.g.
   * 
   * - 'public/index.html'
   * - { 'index.html': 'public/index.html' }
   */
  template?: string | { [entryAlias: string]: string }
  transformIndexHtml?: (html: string, ctx: IndexHtmlTransformContext) => string | void | {
    html?: string
    /** Data of lodash.template */
    templateData?: Record<string, any>
    /**
     * Options of lodash.template
     * @see https://lodash.com/docs/4.17.15#template
     */
    templateOptions?: TemplateOptions
  }

  /** Finally value of `req.url` or entry of Rollup */
  _path?: string
}

export type TemplateOptions = {
  /**
   * @see _.sourceURL
   */
  sourceURL?: string | undefined;
  /** The "escape" delimiter. */
  escape?: RegExp | undefined;
  /** The "evaluate" delimiter. */
  evaluate?: RegExp | undefined;
  /** An object to import into the template as local variables. */
  imports?: Record<string, any> | undefined;
  /** The "interpolate" delimiter. */
  interpolate?: RegExp | undefined;
  /** Used to reference the data object in the template text. */
  variable?: string | undefined;
}

export default function viteHtmlPlugin(options: Options | Options[] = {}): Plugin[] {
  const opts = mappingTemplate(Array.isArray(options) ? options : [options])
  let root: string; const resolveRoot = (config: UserConfig) => {
    // https://github.com/vitejs/vite/blob/cc980b09444f67bdcd07481edf9e0c0de6b9b5bd/packages/vite/src/node/config.ts#L442-L445
    root = normalizePath(config.root ? path.resolve(config.root) : process.cwd())
  }
  const resolvePath = (template: string, prefer: 'short' | 'long') => {
    template = normalizePath(template)
    return prefer === 'long'
      // Rollup input must be absolute path
      ? path.posix.resolve(root, template)
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

        if (opt.transformIndexHtml) {
          const result = opt.transformIndexHtml(html, ctx)
          if (typeof result === 'string') {
            html = result
          } else if (result && typeof result === 'object') {
            const { html: _html, templateOptions, templateData } = result
            // Maybe ejs template
            html = lodashTemplate(_html ?? html, templateOptions)(templateData)
          }
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
            entry: path.posix.join(root, name),
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
