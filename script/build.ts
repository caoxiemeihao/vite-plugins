import path from 'path'
import { OutputOptions, rollup, RollupOptions } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const options: RollupOptions = {
  input: path.join(__dirname, '../src/index.ts'),
  output: {
    file: path.join(__dirname, '../dist/index.js'),
    format: 'cjs',
  },
  plugins: [
    commonjs(),
    nodeResolve(),
    typescript({
      module: 'ESNext',
    }),
  ],
}

rollup(options)
  .then(build => {
    build.write(options.output as OutputOptions)
    console.log('Build success.')
  })
