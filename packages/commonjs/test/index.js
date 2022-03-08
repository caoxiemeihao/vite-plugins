const fs = require('fs');
const path = require('path');
const Module = require('../dist/cjs-esm/Module').default;

const requireJs = path.join(__dirname, 'require.js');
const code = fs.readFileSync(requireJs, 'utf8');

new Module(code, requireJs).analyze();
