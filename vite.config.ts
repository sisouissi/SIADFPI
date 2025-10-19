import { URL, fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        watch: {
          // Ignore the 'api' directory to prevent HMR loops
          // when running alongside a Vercel dev server.
          ignored: ['**/api/**'],
        },
      },
      plugins: [react()],
      resolve: {
        alias: {
          // FIX: `__dirname` is not available in ES modules.
          // `import.meta.url` is the modern, correct way to get the path to the current file's directory.
          '@': fileURLToPath(new URL('.', import.meta.url)),
        }
      }
    };
});