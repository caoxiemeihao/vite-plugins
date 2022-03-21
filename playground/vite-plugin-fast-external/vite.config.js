import { defineConfig } from 'vite';
import external from 'vite-plugin-fast-external';

export default defineConfig({
  plugins: [
    external({
      vue: 'Vue',
      '@angular/core': () => `const Angular = { version: '13.3.0' }; export default Angular;`,
    }),
  ],
});
