import { defineConfig } from 'vite'
import html from 'vite-html-plugin'

export default defineConfig({
  plugins: [
    html([
      {
        // Equivalent to
        // { 'foo.html': 'public/foo.html' }
        template: 'public/foo.html',
        inject: '/src/foo.js',
      },
      {
        template: {
          // Alias
          'bar.html': 'public/bar.ejs.html',
        },
        inject: '/src/bar.js',
        transformIndexHtml: () => ({
          templateData: {
            // `ejs` template data
            templateData: {
              name: 'Kevin',
              age: '25',
            },
          },
        }),
      },
    ]),
  ],
})
