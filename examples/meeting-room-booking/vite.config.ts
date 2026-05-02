import { defineConfig } from 'vite';
import type { Connect, PreviewServer, ViteDevServer } from 'vite';
import { httpApp } from './src/app/http_app';
import { createStore } from './src/app/create_store';

const store = createStore();

const createRuntimeMiddleware = () => {
  return async (
    request: Connect.IncomingMessage,
    response: {
      setHeader: (name: string, value: string) => void;
      end: (chunk?: string) => void;
    },
    next: Connect.NextFunction,
  ) => {
    const handled = await httpApp(store, request, response);

    if (!handled) {
      next();
    }
  };
};

export default defineConfig({
  plugins: [
    {
      name: 'meeting-room-booking-runtime',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(createRuntimeMiddleware());
      },
      configurePreviewServer(server: PreviewServer) {
        server.middlewares.use(createRuntimeMiddleware());
      },
    },
  ],
});
