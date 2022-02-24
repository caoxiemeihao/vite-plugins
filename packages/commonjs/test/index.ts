import fs from 'fs';
import path from 'path';
import Module from '../src/cjs-esm/Module';

const requireJs = path.join(__dirname, 'require.js');
const code = fs.readFileSync(requireJs, 'utf8');

new Module(code, requireJs).analyze();
