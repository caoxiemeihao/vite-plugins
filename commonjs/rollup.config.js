import path from 'path'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

/**
 * @type {import("rollup").RollupOptions}
 */
const options = {
  input: path.join(__dirname, 'src/index.ts'),
  output: {
    dir: path.join(__dirname, 'dist'),
  },
  plugins: [
    commonjs(),
    nodeResolve(),
    typescript(),
  ],
}

export default () => {
  return options
}
