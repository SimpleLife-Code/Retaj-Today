import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  // If running in development (AI Studio preview on port 3000), base is '/'
  // If building via 'npm run build' or 'npm run deploy' for GitHub Pages, base is '/Retaj-Today/' (or process.env.BASE_PATH)
  const isProdBuild = process.env.GITHUB_PAGES === 'true' || process.env.BUILD_FOR_GH === 'true';
  const base = isProdBuild ? '/Retaj-Today/' : '/';

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
