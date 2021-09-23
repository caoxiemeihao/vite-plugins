# vite-plugin-commonjs
An vite plugin for CommonJs syntax

- Pure javascript vite plugin for support CommonJs
- Only dependency `acorn` and `acorn-walk`

## Usage

```javascript
import { vitePluginCommonjs } from 'vite-plugin-commonjs'

export default {
  plugins: [
    vitePluginCommonjs()
  ]
}
```
