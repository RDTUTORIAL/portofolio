import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression';
import { resolve } from 'node:path';

const cardRouteRedirect = () => {
  const attachRedirect = (middlewares) => {
    middlewares.use((request, response, next) => {
      const [pathname, query = ''] = (request.url || '').split('?');

      if (pathname !== '/card') {
        next();
        return;
      }

      response.statusCode = 307;
      response.setHeader('Location', `/card/${query ? `?${query}` : ''}`);
      response.end();
    });
  };

  return {
    name: 'card-route-redirect',
    configureServer(server) {
      attachRedirect(server.middlewares);
    },
    configurePreviewServer(server) {
      attachRedirect(server.middlewares);
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [cardRouteRedirect(), react(), viteCompression()],
  build: {
    rollupOptions: {
      input: {
        main: resolve('index.html'),
        card: resolve('card/index.html'),
      },
    },
  },
})
