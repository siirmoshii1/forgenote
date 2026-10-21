import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  // Support GitHub Pages repository path (e.g. "/forgenote/")
  // Automatically detects GITHUB_REPOSITORY from GitHub Actions or BASE_PATH
  const repoName = process.env.GITHUB_REPOSITORY
    ? process.env.GITHUB_REPOSITORY.split('/')[1]
    : '';
  const rawBase = process.env.BASE_PATH || (repoName ? `/${repoName}/` : '/');
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: base,
          name: 'DayForge — Personal Productivity PWA',
          short_name: 'DayForge',
          description: 'A local-first personal productivity PWA for task planning, markdown knowledge notes, developer toolbox, income tracking, and AI copilot.',
          theme_color: '#09090b',
          background_color: '#09090b',
          display: 'standalone',
          start_url: base,
          scope: base,
          icons: [
            {
              src: `${base}pwa-192x192.png`.replace(/\/\//g, '/'),
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${base}pwa-512x512.png`.replace(/\/\//g, '/'),
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${base}pwa-maskable-512x512.png`.replace(/\/\//g, '/'),
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: `${base}index.html`.replace(/\/\//g, '/'),
          navigateFallbackDenylist: [/^\/api/],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
